import { paymentEmitter } from '../services/paymentService.js';
import notificationService from '../../notification/services/notificationService.js';
import logAction from '../../../utils/auditLogger.js';

export const registerPaymentEventHandlers = () => {
  console.log('🔌 [PAYMENT EVENT HANDLERS INSTANTIATED]');

  /**
   * 1. Payment Completed Event
   */
  paymentEmitter.on('payment.completed', async (txn) => {
    try {
      const propertyTitle = txn.propertyId?.title || 'StayMate Rental';

      // 1. Notify Tenant
      await notificationService.createNotification({
        recipientId: txn.userId,
        notificationType: 'payment_success',
        title: 'Payment Successful',
        message: `Your booking deposit of ₹${txn.amount.toLocaleString('en-IN')} has been captured. View receipt: ${txn.receiptNumber}.`,
        category: 'properties',
        priority: 'high',
        icon: 'credit-card',
        metadata: { transactionId: txn.transactionId, propertyId: txn.propertyId }
      });

      // 2. Notify Owner
      await notificationService.createNotification({
        recipientId: txn.ownerId,
        notificationType: 'payment_received',
        title: 'Booking Deposit Received',
        message: `A tenant has paid a booking deposit of ₹${txn.amount.toLocaleString('en-IN')} for your stay: ${propertyTitle}.`,
        category: 'properties',
        priority: 'high',
        icon: 'dollar-sign',
        metadata: { transactionId: txn.transactionId, propertyId: txn.propertyId }
      });

      // 3. Notify Admin
      // Look up admin users if active database exists
      await logAction({
        userId: txn.userId,
        action: 'PAYMENT_VERIFIED',
        status: 'success',
        details: { transactionId: txn.transactionId, amount: txn.amount }
      });
    } catch (err) {
      console.error('⚠️ [Payment Event Handler Failure] payment.completed:', err.message);
    }
  });

  /**
   * 2. Payment Failed Event
   */
  paymentEmitter.on('payment.failed', async (data) => {
    try {
      // Notify Tenant
      await notificationService.createNotification({
        recipientId: data.userId,
        notificationType: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment attempt of ₹${data.amount.toLocaleString('en-IN')} has failed. Please retry your order.`,
        category: 'properties',
        priority: 'high',
        icon: 'alert-triangle',
        metadata: { orderId: data.orderId }
      });

      // Log Audit Trail
      await logAction({
        userId: data.userId,
        action: 'PAYMENT_COMPLETED',
        status: 'failure',
        details: { orderId: data.orderId, amount: data.amount, error: data.reason }
      });
    } catch (err) {
      console.error('⚠️ [Payment Event Handler Failure] payment.failed:', err.message);
    }
  });
};

export default registerPaymentEventHandlers;
