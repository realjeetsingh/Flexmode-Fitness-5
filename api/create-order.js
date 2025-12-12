// api/create-order.js
const Razorpay = require('razorpay');
require('dotenv').config();

const KEY_ID = process.env.RP_KEY_ID || '';
const KEY_SECRET = process.env.RP_KEY_SECRET || '';

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Basic validation
    const { productId, amount } = req.body || {};
    if (!productId || !amount) {
      return res.status(400).json({ error: 'productId and amount are required' });
    }
    const amountInt = parseInt(amount, 10);
    if (isNaN(amountInt) || amountInt <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    // Defensive: ensure keys are present
    if (!KEY_ID || !KEY_SECRET) {
      console.error('create-order: Missing Razorpay keys. RP_KEY_ID or RP_KEY_SECRET not set.');
      return res.status(500).json({ error: 'server misconfiguration: missing payment keys' });
    }

    const amountPaise = amountInt * 100;
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    console.log('create-order: creating order', { amountPaise, productId });

    // Call Razorpay
    const order = await razorpay.orders.create(options);

    // Successful response
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: KEY_ID
    });

  } catch (err) {
    // Razorpay SDK errors often have structure: { error: { description, reason, code, source } }
    console.error('create-order: caught error', err && (err.stack || err));

    // extract useful info safely
    let debug = {};
    if (err && err.error) debug = { razorpay: err.error };
    else if (err && err.message) debug = { message: err.message };
    else debug = { raw: String(err) };

    // Return detailed (temporary) debug to client for immediate diagnosis
    return res.status(500).json({ error: 'order creation failed', debug });
  }
};
