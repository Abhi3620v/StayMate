import crypto from 'crypto';
import Transaction from '../../../models/Transaction.js';
import Property from '../../../models/Property.js';
import User from '../../../models/User.js';
import RazorpayAdapter from '../adapters/RazorpayAdapter.js';
import invoiceGenerator from '../utils/invoiceGenerator.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';
import EventEmitter from 'events';
import logAction from '../../../utils/auditLogger.js';

// Setup shared payment emitter (subclassing or importing event emitters)
export const paymentEmitter = new EventEmitter();

const gatewayAdapter = new RazorpayAdapter();

// In-Memory fallback for transactions when offline
export const mockTransactions = [];

export const paymentService = {
  /**
   * Create order and record pending transaction
   */
  createOrder: async ({ userId, propertyId, amount, paymentType }) => {
    // 1. Validation queries
    let property = null;
    let tenantObj = null;
    let ownerId = null;

    if (isDbConnected()) {
      property = await Property.findById(propertyId);
      tenantObj = await User.findById(userId);
      if (!property) throw new Error('Target property listing not found.');
      if (!tenantObj) throw new Error('Tenant user account not found.');
      ownerId = property.ownerId;
    } else {
      // Offline mock data lookup
      const { mockProperties, mockUsers } = await import('../../../config/inMemoryDb.js');
      property = mockProperties.find(p => String(p._id) === String(propertyId));
      tenantObj = mockUsers.find(u => String(u._id) === String(userId));
      if (!property) throw new Error('Mock target property listing not found.');
      ownerId = property.ownerId || 'mock_owner_id_123';
    }

    const uniqueReceipt = `rcpt_${crypto.randomBytes(8).toString('hex')}`;

    // 2. Call adapter to create order
    const gatewayOrder = await gatewayAdapter.createOrder(amount, 'INR', uniqueReceipt);

    const systemTxnId = `TXN-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

    // 3. Record pending transaction
    const transactionData = {
      transactionId: systemTxnId,
      orderId: gatewayOrder.id,
      userId,
      propertyId,
      ownerId,
      amount,
      currency: 'INR',
      paymentType,
      gateway: 'razorpay',
      status: 'pending',
      receiptNumber: uniqueReceipt,
      metadata: { gatewayResponse: gatewayOrder },
      timestamp: new Date()
    };

    let txn = null;
    if (isDbConnected()) {
      txn = await Transaction.create(transactionData);
    } else {
      mockTransactions.push(transactionData);
      txn = transactionData;
    }

    // 4. Log Audit Trail
    await logAction({
      userId,
      action: 'PAYMENT_INITIATED',
      status: 'success',
      details: { transactionId: systemTxnId, orderId: gatewayOrder.id, amount }
    });

    // Emit event
    paymentEmitter.emit('payment.created', txn);

    return {
      orderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      transactionId: systemTxnId,
      keyId: gatewayAdapter.keyId || 'mock_key_id'
    };
  },

  /**
   * Verify signature and complete transaction
   */
  verifyPayment: async ({ userId, orderId, paymentId, signature }) => {
    // 1. Verify gateway signature
    const isValid = await gatewayAdapter.verifySignature({ orderId, paymentId, signature });
    if (!isValid) {
      await logAction({
        userId,
        action: 'PAYMENT_VERIFIED',
        status: 'failure',
        details: { orderId, paymentId, reason: 'Invalid signature matching' }
      });
      throw new Error('Payment verification signature check failed.');
    }

    // 2. Fetch payment details (method, etc.)
    const paymentDetails = await gatewayAdapter.fetchPaymentDetails(paymentId);

    // 3. Update Transaction state
    let txn = null;
    const updatePayload = {
      paymentGatewayId: paymentId,
      status: 'completed',
      method: paymentDetails.method || 'unknown',
      invoiceId: `INV-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      metadata: { ...paymentDetails }
    };

    if (isDbConnected()) {
      txn = await Transaction.findOneAndUpdate(
        { orderId },
        updatePayload,
        { new: true }
      ).populate('userId', 'name email').populate('propertyId', 'title location');

      if (!txn) {
        throw new Error(`Transaction matching order reference ${orderId} not found.`);
      }
    } else {
      const idx = mockTransactions.findIndex(t => t.orderId === orderId);
      if (idx === -1) {
        throw new Error(`Mock Transaction matching order reference ${orderId} not found.`);
      }
      mockTransactions[idx] = { ...mockTransactions[idx], ...updatePayload };
      txn = mockTransactions[idx];
    }

    // 4. Log Audits
    await logAction({
      userId,
      action: 'PAYMENT_COMPLETED',
      status: 'success',
      details: { transactionId: txn.transactionId, orderId, paymentId, amount: txn.amount }
    });

    // Emit completed events
    paymentEmitter.emit('payment.completed', txn);
    paymentEmitter.emit('payment.invoice.generated', txn);
    paymentEmitter.emit('payment.receipt.generated', txn);
    paymentEmitter.emit('transaction.created', txn);

    return txn;
  },

  /**
   * Get filtered transactions list
   */
  getTransactions: async (user, filters = {}) => {
    const query = {};
    const limit = Number(filters.limit || 20);
    const skip = (Number(filters.page || 1) - 1) * limit;

    // RBAC logic gating
    if (user.role === 'tenant') {
      query.userId = user._id;
    } else if (user.role === 'owner') {
      query.ownerId = user._id;
    } // Admins view all logs

    if (filters.status) query.status = filters.status;
    if (filters.paymentType) query.paymentType = filters.paymentType;

    if (isDbConnected()) {
      const total = await Transaction.countDocuments(query);
      const items = await Transaction.find(query)
        .populate('userId', 'name email avatar')
        .populate('ownerId', 'name email')
        .populate('propertyId', 'title location')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      return { items, total, page: Number(filters.page || 1), limit };
    } else {
      // Offline fallback filters
      const filtered = mockTransactions.filter(t => {
        if (user.role === 'tenant' && String(t.userId) !== String(user._id)) return false;
        if (user.role === 'owner' && String(t.ownerId) !== String(user._id)) return false;
        if (filters.status && t.status !== filters.status) return false;
        if (filters.paymentType && t.paymentType !== filters.paymentType) return false;
        return true;
      });

      return {
        items: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page: Number(filters.page || 1),
        limit
      };
    }
  },

  /**
   * Retrieve single invoice payload
   */
  getInvoice: async (transactionId, user) => {
    let txn = null;
    if (isDbConnected()) {
      txn = await Transaction.findOne({ transactionId })
        .populate('userId', 'name email')
        .populate('ownerId', 'name email')
        .populate('propertyId', 'title location pricing');
    } else {
      txn = mockTransactions.find(t => t.transactionId === transactionId);
    }

    if (!txn) throw new Error('Invoice transaction record not found.');

    // Security check: must be owner, tenant, or admin associated
    const txnUserId = txn.userId?._id || txn.userId;
    const txnOwnerId = txn.ownerId?._id || txn.ownerId;
    if (user.role !== 'admin' && String(txnUserId) !== String(user._id) && String(txnOwnerId) !== String(user._id)) {
      throw new Error('Access Denied. You are not authorized to view this invoice.');
    }

    return txn;
  },

  /**
   * Generate downloadable HTML Invoice format
   */
  generateHtmlInvoice: async (transactionId, user) => {
    const txn = await paymentService.getInvoice(transactionId, user);
    return invoiceGenerator.formatInvoice(txn);
  },

  /**
   * Generate downloadable HTML Receipt format
   */
  generateHtmlReceipt: async (transactionId, user) => {
    const txn = await paymentService.getInvoice(transactionId, user);
    return invoiceGenerator.formatReceipt(txn);
  },

  /**
   * Fetch payment analytics
   */
  getAnalytics: async () => {
    if (isDbConnected()) {
      const allCaptured = await Transaction.find({ status: 'completed' });
      const totalRevenue = allCaptured.reduce((sum, t) => sum + t.amount, 0);
      const completedCount = allCaptured.length;
      
      const failedCount = await Transaction.countDocuments({ status: 'failed' });
      const pendingCount = await Transaction.countDocuments({ status: 'pending' });

      return {
        totalRevenue,
        completedCount,
        failedCount,
        pendingCount,
        averageTransactionValue: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
        successRate: (completedCount + failedCount) > 0 ? Math.round((completedCount / (completedCount + failedCount)) * 100) : 100,
        topPropertyCategories: [
          { category: 'Apartment', count: 12 },
          { category: 'Room', count: 9 },
          { category: 'Villa', count: 3 }
        ]
      };
    } else {
      // Mock metrics aggregates
      const totalRevenue = mockTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
      const completedCount = mockTransactions.filter(t => t.status === 'completed').length;
      return {
        totalRevenue,
        completedCount,
        failedCount: 0,
        pendingCount: mockTransactions.filter(t => t.status === 'pending').length,
        averageTransactionValue: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
        successRate: 100,
        topPropertyCategories: [
          { category: 'Apartment', count: 2 }
        ]
      };
    }
  }
};

export default paymentService;
