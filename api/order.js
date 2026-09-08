// In-memory rate limiting map with bounded sweep (per Vercel instance)
const rateLimitMap = new Map();

function isRateLimited(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v.firstReq > windowMs) rateLimitMap.delete(k);
    }
    if (rateLimitMap.size > 500) rateLimitMap.clear();
  }
  const record = rateLimitMap.get(ip) || { count: 0, firstReq: now };

  if (now - record.firstReq > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstReq: now });
    return false;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return record.count > limit;
}

export default async function handler(req, res) {
  // CORS Configuration: Restrict strictly to Sackhe deployment origins and localhost
  const allowedOrigins = [
    'https://sackhe.srishanth.com',
    'https://sackhetechnologies.com',
    'https://sackhe.vercel.app'
  ];
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.endsWith('.srishanth.com') ||
      (origin.includes('sackhe') && origin.endsWith('.vercel.app')) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed. Use POST.' });
  }

  // Enforce Payload Size Cap (10KB)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240) {
    return res.status(413).json({ ok: false, error: 'Payload Too Large. Maximum size is 10KB.' });
  }

  // Enforce Rate Limiting (5 requests per minute per IP)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ ok: false, error: 'Too Many Requests. Please wait 60 seconds.' });
  }

  try {
    const body = req.body || {};
    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 100);
    const phone = String(body.phone || '').trim().slice(0, 30);
    const organization = String(body.organization || '').trim().slice(0, 120);
    const address = String(body.address || '').trim().slice(0, 200);
    const city = String(body.city || '').trim().slice(0, 50);
    const pincode = String(body.pincode || '').trim().slice(0, 15);
    const payment_method = String(body.payment_method || 'Offline Purchase Order (Institutional)').slice(0, 100);
    const notes = String(body.notes || '').trim().slice(0, 2000);
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

    if (!name || !email || !phone || rawItems.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: name, email, phone, and items are required.'
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
    const items = rawItems.map(it => ({
      name: String(it.name || 'Equipment / Supply').slice(0, 100),
      price: Math.max(0, Number(it.price) || 0),
      quantity: Math.max(1, Math.min(1000, Number(it.quantity) || 1))
    }));

    const totalAmount = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const formattedTotal = totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : 'Custom Engineering Quote';

    const itemsSummary = items.map(it => `- ${it.name} x ${it.quantity} (₹${(it.price * it.quantity).toLocaleString('en-IN')})`).join('\n');

    // Build structured procurement draft
    const formattedDraft = [
      `Sackhe Technologies - Institutional Procurement Requisition`,
      `============================================================`,
      `Requisition ID : ${orderId}`,
      `Timestamp      : ${new Date().toISOString()}`,
      `Organization   : ${organization || 'Individual / Enterprise'}`,
      `Primary Contact: ${name}`,
      `Contact Email  : ${email}`,
      `Contact Phone  : ${phone}`,
      `Delivery Site  : ${address ? `${address}, ${city} - ${pincode}` : 'To be coordinated'}`,
      `Billing Method : ${payment_method}`,
      ``,
      `Requisition Items:`,
      `${itemsSummary}`,
      `Estimated Total: ${formattedTotal}`,
      ``,
      `Procurement Notes:`,
      `${notes || 'None provided'}`,
      `============================================================`,
      `Notice: This document constitutes a formal procurement inquiry and RFQ commitment.`,
      `An official proforma invoice and technical schedule will be issued upon desk review.`
    ].join('\n');

    const mailtoSubject = encodeURIComponent(`[Procurement Requisition ${orderId}] ${organization || name} - ${formattedTotal}`);
    const mailtoBody = encodeURIComponent(formattedDraft);
    const mailtoUrl = `mailto:info@sackhetechnologies.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Optional outbound webhook dispatch if configured in deployment environment
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL || process.env.DISPATCH_WEBHOOK_URL;
    let dispatched = false;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'procurement_order',
            orderId,
            name,
            email,
            phone,
            organization,
            address,
            city,
            pincode,
            payment_method,
            items,
            totalAmount,
            notes,
            timestamp: new Date().toISOString()
          })
        });
        dispatched = true;
      } catch (webhookErr) {
        console.warn('Outbound webhook failed:', webhookErr.message);
      }
    }

    return res.status(200).json({
      ok: true,
      orderId,
      dispatched,
      totalAmount,
      currency: 'INR',
      mailtoUrl,
      formattedDraft,
      message: `Procurement requisition ${orderId} prepared. Please dispatch via email to info@sackhetechnologies.com.`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Order API Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error processing procurement order.' });
  }
}
