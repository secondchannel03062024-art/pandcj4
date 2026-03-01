const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Order notes for reference
 * @returns {Promise<object>} - Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', notes = {}) => {
  try {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Razorpay accepts amount in paise (1 rupee = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency,
      notes,
      payment_capture: 1, // Auto capture payment
    };

    console.log('Creating Razorpay order:', { amount, currency, notes });
    const order = await razorpay.orders.create(orderOptions);

    return {
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount / 100, // Convert back to rupees for response
        currency: order.currency,
        notes: order.notes,
        createdAt: new Date(order.created_at * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Razorpay order',
    };
  }
};

/**
 * Verify Payment Signature (Webhook Verification)
 * @param {string} razorpayOrderId - Razorpay Order ID
 * @param {string} razorpayPaymentId - Razorpay Payment ID
 * @param {string} razorpaySignature - Razorpay Signature from webhook
 * @returns {boolean} - True if signature is valid
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    // Create signature string
    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;

    // Generate HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      console.warn('Signature Mismatch:', {
        expected: expectedSignature,
        received: razorpaySignature,
      });
    }

    return isValid;
  } catch (error) {
    console.error('Signature Verification Error:', error);
    return false;
  }
};

/**
 * Fetch Payment Details from Razorpay
 * @param {string} paymentId - Razorpay Payment ID
 * @returns {Promise<object>} - Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100, // Convert to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        acquirerData: payment.acquirer_data,
        createdAt: new Date(payment.created_at * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Fetch Payment Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment details',
    };
  }
};

/**
 * Refund Payment
 * @param {string} paymentId - Razorpay Payment ID
 * @param {number} amount - Amount to refund in rupees (optional - full refund if not provided)
 * @returns {Promise<object>} - Refund details
 */
const refundPayment = async (paymentId, amount = null) => {
  try {
    const refundOptions = {};

    // If amount is specified, convert to paise
    if (amount !== null && amount > 0) {
      refundOptions.amount = Math.round(amount * 100);
    }

    console.log('Processing refund for payment:', paymentId, refundOptions);
    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    return {
      success: true,
      data: {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100, // Convert to rupees
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Refund Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process refund',
    };
  }
};

/**
 * Fetch Refund Details
 * @param {string} refundId - Razorpay Refund ID
 * @returns {Promise<object>} - Refund details
 */
const fetchRefundDetails = async (refundId) => {
  try {
    const refund = await razorpay.refunds.fetch(refundId);

    return {
      success: true,
      data: {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Fetch Refund Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch refund details',
    };
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
  refundPayment,
  fetchRefundDetails,
};
