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
    const { name, email, phone, organization, address, city, pincode, items, payment_method, notes } = req.body || {};

    if (!name || !email || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required order fields: name, email, phone, and valid items array are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email address format.'
      });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const totalAmount = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

    console.log(`[Institutional Order Received ${orderId}] Org: ${organization || 'Individual'}, Contact: ${name} <${email}>, Items: ${items.length}, Total: ₹${totalAmount}`);

    return res.status(200).json({
      ok: true,
      orderId,
      totalAmount,
      currency: 'INR',
      status: 'Inquiry / PO Request Submitted',
      message: `Procurement request ${orderId} registered. Our corporate desk will review your details and issue a proforma invoice.`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Order API Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error processing procurement order.' });
  }
}
