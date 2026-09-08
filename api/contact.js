export default async function handler(req, res) {
  // Set CORS and JSON headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { name, email, phone, organization, product, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: name, email, and message are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email address format.'
      });
    }

    const inquiryId = `INQ-${Date.now().toString().slice(-6)}`;
    console.log(`[Inquiry Received ${inquiryId}] From: ${name} <${email}>, Org: ${organization || 'N/A'}, Product: ${product || 'General'}`);

    return res.status(200).json({
      ok: true,
      inquiryId,
      message: 'Inquiry received successfully. Our sales and advisory desk will reach out shortly.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Contact API Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error processing contact inquiry.' });
  }
}
