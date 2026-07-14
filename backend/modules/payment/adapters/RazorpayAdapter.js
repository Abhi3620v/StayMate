import crypto from 'crypto';
import PaymentGatewayAdapter from './PaymentGatewayAdapter.js';

export class RazorpayAdapter extends PaymentGatewayAdapter {
  constructor() {
    super('razorpay');
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Auto-detect offline/mock capability
    this.isMockMode = !this.keyId || !this.keySecret || process.env.NODE_ENV === 'test';
    if (this.isMockMode) {
      console.log('🔌 [Razorpay Adapter initialized in Mock Mode (offline/test fallback)]');
    }
  }

  /**
   * Create order mock/live
   */
  async createOrder(amount, currency = 'INR', receipt) {
    if (this.isMockMode) {
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      return {
        id: mockOrderId,
        amount: amount * 100, // Razorpay works in paise
        currency,
        receipt,
        status: 'created',
        notes: { mode: 'mock' }
      };
    }

    // Live Razorpay API (via fetch to avoid requiring heavy third-party SDK dependencies)
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    try {
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to paise
          currency,
          receipt,
          notes: { platform: 'StayMate' }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Razorpay Order creation failed: ${errorText}`);
      }

      return await res.json();
    } catch (err) {
      throw new Error(`Gateway Error: ${err.message}`);
    }
  }

  /**
   * Verify signature using HMAC SHA256
   */
  async verifySignature({ orderId, paymentId, signature }) {
    if (this.isMockMode) {
      // Mock mode checks if signature follows mock structure
      return signature === 'mock_signature' || String(signature).startsWith('mock_');
    }

    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body.toString())
        .digest('hex');
      return expectedSignature === signature;
    } catch (err) {
      return false;
    }
  }

  /**
   * Fetch payment details live or mock
   */
  async fetchPaymentDetails(paymentId) {
    if (this.isMockMode || paymentId.startsWith('pay_mock_')) {
      return {
        id: paymentId,
        entity: 'payment',
        amount: 500000, // 5000 INR in paise
        currency: 'INR',
        status: 'captured',
        method: 'upi',
        card_id: null,
        bank: null,
        wallet: null,
        vpa: 'upi@mock',
        email: 'tenant@staymate.com',
        contact: '+919999999999',
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    try {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!res.ok) {
        throw new Error(`Razorpay fetch payment details failed for ID ${paymentId}`);
      }

      return await res.json();
    } catch (err) {
      throw new Error(`Gateway Error: ${err.message}`);
    }
  }
}

export default RazorpayAdapter;
