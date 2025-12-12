const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RP_KEY_ID || '',
  key_secret: process.env.RP_KEY_SECRET || ''
});

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { productId, amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    const amountPaise = parseInt(amount,10) * 100;
    const order = await razorpay.orders.create({ amount: amountPaise, currency: 'INR', receipt: `rcpt_${Date.now()}`, payment_capture: 1 });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RP_KEY_ID });
  } catch (err) {
    console.error('create-order err', err);
    return res.status(500).json({ error: 'order creation failed' });
  }
};
