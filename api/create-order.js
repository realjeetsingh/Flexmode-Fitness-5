// /api/create-order.js
const Razorpay = require('razorpay');
require('dotenv').config();

const KEY_ID = process.env.RP_KEY_ID || '';
const KEY_SECRET = process.env.RP_KEY_SECRET || '';

// Defensive check
if (!KEY_ID || !KEY_SECRET) {
  console.error('Missing Razorpay keys: set RP_KEY_ID and RP_KEY_SECRET in env');
}

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Basic validation
    const { productId, amount } = req.body || {};
    if (!productId || !amount) {
      console.warn('create-order: missing productId or amount', { productId, amount });
      return res.status(400).json({ error: 'productId and amount are required' });
    }

    const amountInt = parseInt(amount, 10);
    if (isNaN(amountInt) || amountInt <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    // Build options
    const amountPaise = amountInt * 100;
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    console.log('create-order: creating razorpay order', { productId, amountPaise });

    const order = await razorpay.orders.create(options);
    console.log('create-order: order created', { id: order.id, amount: order.amount });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: KEY_ID
    });

  } catch (err) {
    // Log complete error for server logs (do NOT send secret info to client)
    console.error('create-order: unexpected error', err && (err.stack || err));
    // Provide a helpful message back to the client while hiding internals
    return res.status(500).json({ error: 'order creation failed', details: err && err.message ? err.message : undefined });
  }
};
