const fs = require('fs');
const path = require('path');
require('dotenv').config();

// tokens mirror the in-memory store used in verify-payment.js
// Note: In Vercel serverless this in-memory store will be ephemeral across invocations.
// For production, use Redis or return S3 presigned URLs.
const tokens = {}; // placeholder; real implementation should use persistent store

// Simple helper to stream file if present
module.exports = (req, res) => {
  try {
    const token = req.query.token || req.url.split('/').pop();
    if(!token) return res.status(400).send('token required');

    // Since tokens in serverless can't be shared, this endpoint works only if token mapping is persistent.
    // For dev, allow direct file download of protected-files.
    const filePath = path.join(process.cwd(), 'protected-files', 'flexmode-starter.pdf');
    if(!fs.existsSync(filePath)) return res.status(404).send('file not found');

    res.setHeader('Content-Disposition', 'attachment; filename=flexmode-starter.pdf');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('download err', err);
    res.status(500).send('server error');
  }
};
