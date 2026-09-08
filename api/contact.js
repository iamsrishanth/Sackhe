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
    const product = String(body.product || '').trim().slice(0, 100);
    const message = String(body.message || '').trim().slice(0, 3000);

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

    // Build structured inquiry draft
    const formattedDraft = [
      `Sackhe Technologies - Contact & Inquiry Requisition`,
      `====================================================`,
      `Reference ID : ${inquiryId}`,
      `Timestamp    : ${new Date().toISOString()}`,
      `Contact Name : ${name}`,
      `Email        : ${email}`,
      `Phone        : ${phone || 'Not provided'}`,
      `Organization : ${organization || 'Not provided'}`,
      `Interest     : ${product || 'General Inquiry'}`,
      ``,
      `Message:`,
      `${message}`,
      `====================================================`
    ].join('\n');

    const mailtoSubject = encodeURIComponent(`[Inquiry ${inquiryId}] ${product || 'Inquiry'} - ${name}`);
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
            type: 'contact_inquiry',
            inquiryId,
            name,
            email,
            phone,
            organization,
            product,
            message,
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
      inquiryId,
      dispatched,
      mailtoUrl,
      formattedDraft,
      message: 'Inquiry draft prepared. Please dispatch via email to info@sackhetechnologies.com.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Contact API Error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error processing contact inquiry.' });
  }
}
