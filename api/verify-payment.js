const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// In-memory token store (serverless ephemeral) - for production use Redis
const tokens = {};

function createToken(filename, ttl=300){
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = Date.now() + ttl*1000;
  tokens[token] = { filename, expiresAt };
  return token;
}

function getFileForProduct(productId){
  if(productId === 'flexmode-starter') return path.join(process.cwd(), 'protected-files', 'flexmode-starter.pdf');
  return null;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, email } = req.body;
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'missing fields' });

    const expected = crypto.createHmac('sha256', process.env.RP_KEY_SECRET || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if(expected !== razorpay_signature) return res.status(400).json({ success:false, error:'signature mismatch' });

    const filePath = getFileForProduct(productId);
    if(!filePath || !fs.existsSync(filePath)) return res.status(400).json({ success:false, error:'product not found' });

    const token = createToken(path.basename(filePath), 300);
    const downloadUrl = `${process.env.SERVER_DOMAIN || ''}/api/download/${token}`;
    return res.status(200).json({ success:true, downloadUrl });
  } catch (err) {
    console.error('verify-payment err', err);
    return res.status(500).json({ success:false, error:'server error' });
  }
};
