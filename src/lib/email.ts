import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface ContactInquiryPayload {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  submittedAt?: string;
}

export type SmtpDiagnosticCode =
  | 'SMTP_CONFIG_MISSING'
  | 'SMTP_AUTH_FAILED'
  | 'SMTP_CONNECTION_FAILED'
  | 'SMTP_TLS_PORT_ERROR'
  | 'SMTP_RECIPIENT_REJECTED'
  | 'SMTP_DISPATCH_ERROR';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: SmtpDiagnosticCode;
  detail?: string;
}

export function categorizeSmtpError(err: any): { code: SmtpDiagnosticCode; detail: string } {
  const msg = (err?.message || '').toLowerCase();
  const code = (err?.code || '').toUpperCase();
  const responseCode = err?.responseCode || 0;

  if (
    code === 'EAUTH' ||
    responseCode === 535 ||
    msg.includes('username and password not accepted') ||
    msg.includes('invalid login') ||
    msg.includes('badcredentials')
  ) {
    return {
      code: 'SMTP_AUTH_FAILED',
      detail:
        'Authentication failed. Please verify your EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD (for Gmail, use a 16-character Google App Password, not your standard password).',
    };
  }

  if (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'EHOSTUNREACH' ||
    msg.includes('connect econnrefused') ||
    msg.includes('timed out')
  ) {
    return {
      code: 'SMTP_CONNECTION_FAILED',
      detail:
        'Could not connect to SMTP server. Please verify EMAIL_SERVER_HOST and check network/firewall connectivity.',
    };
  }

  if (
    msg.includes('wrong version number') ||
    msg.includes('ssl routines') ||
    msg.includes('tlsv1') ||
    msg.includes('self signed') ||
    msg.includes('certificate')
  ) {
    return {
      code: 'SMTP_TLS_PORT_ERROR',
      detail:
        'TLS/SSL port mismatch or certificate issue. For port 465 set secure=true, for port 587 set secure=false (STARTTLS).',
    };
  }

  if ((responseCode >= 550 && responseCode <= 553) || msg.includes('recipient address rejected')) {
    return {
      code: 'SMTP_RECIPIENT_REJECTED',
      detail: 'The recipient address was rejected by the SMTP server.',
    };
  }

  return {
    code: 'SMTP_DISPATCH_ERROR',
    detail: err?.message || 'Unknown SMTP dispatch failure.',
  };
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: EmailPayload): Promise<EmailResult> {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const port = Number(process.env.EMAIL_SERVER_PORT) || 587;
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    (user ? `KSHAN Concierge <${user}>` : 'KSHAN Concierge <kshan92788@gmail.com>');

  const isHostMissing = !host || host.includes('example.com');
  const isUserMissing = !user || user.includes('example.com');
  const isPassMissing = !pass || pass.includes('password_here');

  // Server-side diagnostic logging (NEVER print the password)
  console.log(`\n======================================================`);
  console.log(`[SMTP DIAGNOSTIC INSPECTION]`);
  console.log(`EMAIL_SERVER_HOST:     ${host ? `"${host}"` : '[MISSING - REQUIRED]'}`);
  console.log(`EMAIL_SERVER_PORT:     ${port} (Default: 587 for STARTTLS, 465 for SSL)`);
  console.log(`EMAIL_SERVER_USER:     ${user ? `"${user}"` : '[MISSING - REQUIRED]'}`);
  console.log(`EMAIL_SERVER_PASSWORD: ${!isPassMissing ? '[CONFIGURED]' : '[MISSING - REQUIRED]'}`);
  console.log(`EMAIL_FROM:            "${from}"`);
  console.log(`Recipient (To):        "${to}"`);
  console.log(`Reply-To:              "${replyTo || '[NOT SET]'}"`);
  console.log(`Subject:               "${subject}"`);
  console.log(`======================================================`);

  if (isHostMissing || isUserMissing || isPassMissing) {
    const missingKeys: string[] = [];
    if (isHostMissing) missingKeys.push('EMAIL_SERVER_HOST');
    if (isUserMissing) missingKeys.push('EMAIL_SERVER_USER');
    if (isPassMissing) missingKeys.push('EMAIL_SERVER_PASSWORD');

    const detailMsg = `Missing required SMTP environment variables in .env: ${missingKeys.join(', ')}.`;
    console.error(`[SMTP ERROR - CONFIG MISSING] ${detailMsg}`);
    console.error(`👉 Configure your SMTP credentials in .env to enable real email sending.`);
    console.log(`======================================================\n`);

    return {
      success: false,
      code: 'SMTP_CONFIG_MISSING',
      error: 'SMTP credentials are not configured in .env.',
      detail: detailMsg,
    };
  }

  try {
    const isSecure = port === 465;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      ...(replyTo ? { replyTo } : {}),
    });

    console.log(`[SMTP SUCCESS] Email delivered successfully! Message ID: ${info.messageId} | Recipient: ${to}`);
    console.log(`======================================================\n`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    const categorized = categorizeSmtpError(err);
    console.error(`[SMTP FAILURE - ${categorized.code}] ${categorized.detail}`);
    console.error(`Raw Error: ${err?.message || err}`);
    console.log(`======================================================\n`);

    return {
      success: false,
      code: categorized.code,
      error: 'Failed to dispatch email through SMTP server.',
      detail: categorized.detail,
    };
  }
}

// -------------------------------------------------------------
// Luxury HTML Email Templates
// -------------------------------------------------------------

function emailBaseWrapper(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0c10; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #101218; border: 1px solid #222530; border-radius: 4px; overflow: hidden; }
    .header { padding: 40px 30px; text-align: center; border-bottom: 1px solid #222530; background-color: #0b0c10; }
    .brand-title { color: #c5a880; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0; }
    .brand-subtitle { color: #71717a; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 6px; }
    .body-content { padding: 40px 30px; line-height: 1.6; font-size: 15px; color: #e4e4e7; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #c5a880; color: #09090b !important; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; margin-top: 25px; }
    .footer { padding: 30px; text-align: center; border-top: 1px solid #222530; font-size: 12px; color: #71717a; background-color: #0b0c10; }
    .table { width: 100%; border-collapse: collapse; margin: 25px 0; }
    .table th { text-align: left; padding: 10px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .table td { padding: 14px 10px; border-bottom: 1px solid #18181b; color: #f4f4f5; font-size: 14px; }
    .highlight { color: #c5a880; font-weight: 600; }
  </style>
</head>
<body>
  <div style="padding: 40px 15px;">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">KSHAN</h1>
        <div class="brand-subtitle">Haute Horlogerie • Geneve & Mumbai</div>
      </div>
      <div class="body-content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin: 0 0 10px 0;">Maison KSHAN Atelier • Surat, Gujarat 395004, India</p>
        <p style="margin: 0;">For dedicated VIP concierge assistance, email kshan92788@gmail.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function getContactInquiryEmailHtml(inquiry: ContactInquiryPayload): string {
  const timestamp =
    inquiry.submittedAt ||
    new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

  const body = `
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 500; margin-top: 0;">New Customer Concierge Inquiry</h2>
    <p style="color: #c5a880; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">
      Maison KSHAN Client Services Telemetry
    </p>

    <div style="background-color: #161820; padding: 22px; border: 1px solid #27272a; border-radius: 4px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #a1a1aa; width: 140px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Customer Name:</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Customer Email:</td>
          <td style="padding: 8px 0; color: #c5a880; font-size: 14px;"><a href="mailto:${inquiry.email}" style="color: #c5a880; text-decoration: none;">${inquiry.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Customer Phone:</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px;"><a href="tel:${inquiry.phone}" style="color: #ffffff; text-decoration: none;">${inquiry.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Inquiry Type:</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${inquiry.inquiryType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Submission Time:</td>
          <td style="padding: 8px 0; color: #71717a; font-size: 13px;">${timestamp}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #0d0f14; padding: 20px; border-left: 3px solid #c5a880; margin: 20px 0;">
      <div style="font-size: 12px; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.1em; margin-bottom: 8px;">Customer Message</div>
      <p style="color: #e4e4e7; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0;">${inquiry.message}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="mailto:${inquiry.email}?subject=Re:%20${encodeURIComponent(inquiry.inquiryType)}%20-%20KSHAN%20Concierge" class="btn">Reply to Customer</a>
    </div>
  `;

  return emailBaseWrapper('New Customer Inquiry - KSHAN', body);
}

export function getOrderConfirmationEmailHtml(order: {
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  items: Array<{ name: string; brand: string; quantity: number; price: string }>;
  shippingAddress: string;
}): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td><strong>${item.brand}</strong> - ${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.price}</td>
      </tr>
    `
    )
    .join('');

  const body = `
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 500; margin-top: 0;">Order Acquisition Confirmed</h2>
    <p>Dear ${order.customerName},</p>
    <p>Thank you for entrusting your horological acquisition to KSHAN. Your order <span class="highlight">#${order.orderNumber}</span> has been successfully placed and is now undergoing vault verification and white-glove inspection.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Timepiece</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="font-weight: 600; text-align: right; padding-top: 20px;">Total Amount:</td>
          <td style="font-weight: 700; text-align: right; color: #c5a880; font-size: 16px; padding-top: 20px;">${order.totalAmount}</td>
        </tr>
      </tbody>
    </table>

    <div style="background-color: #161820; padding: 20px; border: 1px solid #27272a; margin-top: 20px;">
      <div style="font-size: 12px; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.1em; margin-bottom: 8px;">Delivery Address</div>
      <div style="color: #e4e4e7; font-size: 14px;">${order.shippingAddress}</div>
    </div>

    <p style="margin-top: 25px;">You can monitor the live progress of your shipment and download your official VAT/GST invoice through our concierge portal.</p>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track-order?orderId=${order.orderNumber}" class="btn">Track Your Timepiece</a>
    </div>
  `;

  return emailBaseWrapper(`Order Confirmation #${order.orderNumber}`, body);
}

export function getShipmentDispatchedEmailHtml(shipment: {
  orderNumber: string;
  customerName: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}): string {
  const body = `
    <h2 style="color: #ffffff; font-size: 20px; font-weight: 500; margin-top: 0;">Your Timepiece Has Dispatched</h2>
    <p>Dear ${shipment.customerName},</p>
    <p>We are delighted to inform you that order <span class="highlight">#${shipment.orderNumber}</span> has completed our 18-point timing and casing inspection and is now in transit via insured armored transport.</p>

    <div style="background-color: #161820; padding: 20px; border: 1px solid #27272a; margin: 25px 0;">
      <div style="margin-bottom: 12px;"><span style="color: #a1a1aa;">Armored Carrier:</span> <strong>${shipment.courierName}</strong></div>
      <div style="margin-bottom: 12px;"><span style="color: #a1a1aa;">Tracking Number:</span> <span class="highlight">${shipment.trackingNumber}</span></div>
      ${shipment.estimatedDelivery ? `<div><span style="color: #a1a1aa;">Estimated Arrival:</span> <strong>${shipment.estimatedDelivery}</strong></div>` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${shipment.trackingUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track-order?orderId=${shipment.orderNumber}`}" class="btn">View Live Tracking</a>
    </div>
  `;

  return emailBaseWrapper(`Shipment Dispatched #${shipment.orderNumber}`, body);
}
