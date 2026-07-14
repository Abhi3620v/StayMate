/**
 * Abstract Payment Gateway Adapter base class
 */
export class PaymentGatewayAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Create an order in the gateway
   * @param {number} amount - Amount in standard currency units (e.g. INR)
   * @param {string} currency - e.g. "INR"
   * @param {string} receipt - Local unique receipt identifier
   * @returns {Promise<Object>} order payload from gateway
   */
  async createOrder(amount, currency, receipt) {
    throw new Error('createOrder method must be implemented by adapter subclasses.');
  }

  /**
   * Verify signature of payment captured
   * @param {Object} verificationData - orderId, paymentId, signature
   * @returns {Promise<boolean>} validation status
   */
  async verifySignature(verificationData) {
    throw new Error('verifySignature method must be implemented by adapter subclasses.');
  }

  /**
   * Fetch payment details from gateway
   * @param {string} paymentId 
   * @returns {Promise<Object>} payment details
   */
  async fetchPaymentDetails(paymentId) {
    throw new Error('fetchPaymentDetails method must be implemented by adapter subclasses.');
  }
}

export default PaymentGatewayAdapter;
