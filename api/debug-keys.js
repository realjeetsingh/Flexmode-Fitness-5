// api/debug-keys.js
require('dotenv').config();

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // do not return actual secret values
  const hasKeyId = !!process.env.RP_KEY_ID;
  const hasKeySecret = !!process.env.RP_KEY_SECRET;
  const serverDomain = process.env.SERVER_DOMAIN ? true : false;

  return res.status(200).json({
    ok: true,
    env: {
      RP_KEY_ID_SET: hasKeyId,
      RP_KEY_SECRET_SET: hasKeySecret,
      SERVER_DOMAIN_SET: serverDomain
    },
    note: 'This endpoint confirms whether required env vars are configured (it does NOT expose secret values).'
  });
};
