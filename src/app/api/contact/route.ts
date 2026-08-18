import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getContactInquiryEmailHtml } from '@/lib/email';

const EMAIL_RECIPIENT = 'kshan92788@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request payload. Please submit a valid form.' },
        { status: 400 }
      );
    }

    const rawName = String(body.name || '').trim();
    const rawEmail = String(body.email || '').trim();
    const rawPhone = String(body.phone || '').trim();
    const rawInquiryType = String(body.inquiryType || body.subject || '').trim();
    const rawMessage = String(body.message || '').trim();

    // 1. Required fields check
    if (!rawName || !rawEmail || !rawPhone || !rawMessage) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Phone, Message) are required.' },
        { status: 400 }
      );
    }

    // 2. Email format validation
    if (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 150) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Length validations
    if (rawName.length < 2 || rawName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    if (rawPhone.length < 5 || rawPhone.length > 30) {
      return NextResponse.json(
        { error: 'Phone number must be between 5 and 30 characters.' },
        { status: 400 }
      );
    }

    if (rawMessage.length < 5 || rawMessage.length > 3000) {
      return NextResponse.json(
        { error: 'Message must be between 5 and 3000 characters.' },
        { status: 400 }
      );
    }

    // 4. Header injection prevention (sanitize single-line fields)
    const sanitizedName = rawName.replace(/[\r\n]/g, ' ');
    const sanitizedEmail = rawEmail.replace(/[\r\n]/g, '');
    const sanitizedPhone = rawPhone.replace(/[\r\n]/g, ' ');
    const sanitizedInquiryType = (rawInquiryType || 'General Concierge Assistance').replace(/[\r\n]/g, ' ');

    const htmlContent = getContactInquiryEmailHtml({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      inquiryType: sanitizedInquiryType,
      message: rawMessage,
    });

    const result = await sendEmail({
      to: EMAIL_RECIPIENT,
      subject: 'New Customer Inquiry - KSHAN',
      html: htmlContent,
      replyTo: sanitizedEmail,
    });

    if (!result.success) {
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json(
        {
          error:
            'We could not send your inquiry. Please try again or contact us on WhatsApp.',
          ...(isDev
            ? {
                diagnostic: {
                  code: result.code,
                  detail: result.detail,
                },
              }
            : {}),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been sent successfully. Our concierge will contact you shortly.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      {
        error:
          'We could not send your inquiry. Please try again or contact us on WhatsApp.',
      },
      { status: 500 }
    );
  }
}
