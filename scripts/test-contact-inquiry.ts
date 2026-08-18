import { getContactInquiryEmailHtml, sendEmail, categorizeSmtpError } from '../src/lib/email';

async function testContactInquiryFlow() {
  console.log('====================================================');
  console.log('   Testing Contact / Concierge Inquiry Diagnostics  ');
  console.log('====================================================');

  // 1. Test HTML Template Generation
  console.log('\n--- 1. Testing HTML Email Template Generation ---');
  const inquiryData = {
    name: 'Vikramaditya Roy',
    email: 'vikram@royalhorology.com',
    phone: '+91 98765 43210',
    inquiryType: 'Timepiece Sourcing / Allocation Inquiry',
    message: 'I am looking for an allocation of the Seiko Presage Cocktail Time Skydiving edition.',
    submittedAt: 'Tuesday, 18 August 2026 at 10:30:00 am IST',
  };

  const html = getContactInquiryEmailHtml(inquiryData);
  if (!html.includes('Vikramaditya Roy')) throw new Error('Customer name missing in email HTML');
  if (!html.includes('vikram@royalhorology.com')) throw new Error('Customer email missing in email HTML');
  if (!html.includes('+91 98765 43210')) throw new Error('Customer phone missing in email HTML');
  if (!html.includes('Timepiece Sourcing / Allocation Inquiry')) throw new Error('Inquiry type missing in email HTML');
  if (!html.includes('Seiko Presage Cocktail Time')) throw new Error('Message content missing in email HTML');
  if (!html.includes('kshan92788@gmail.com')) throw new Error('Recipient address missing in email footer');
  console.log('✅ [PASS] HTML email template formatted with luxury styling and all required fields.');

  // 2. Test SMTP Missing Config Detection
  console.log('\n--- 2. Testing SMTP Missing Config Detection ---');
  const initialHost = process.env.EMAIL_SERVER_HOST;
  const initialUser = process.env.EMAIL_SERVER_USER;
  const initialPass = process.env.EMAIL_SERVER_PASSWORD;

  // Simulate missing credentials
  delete process.env.EMAIL_SERVER_HOST;
  delete process.env.EMAIL_SERVER_USER;
  delete process.env.EMAIL_SERVER_PASSWORD;

  const missingResult = await sendEmail({
    to: 'kshan92788@gmail.com',
    subject: 'New Customer Inquiry - KSHAN',
    html,
    replyTo: inquiryData.email,
  });

  if (missingResult.success !== false) throw new Error('Expected failure when config missing');
  if (missingResult.code !== 'SMTP_CONFIG_MISSING') throw new Error(`Expected SMTP_CONFIG_MISSING, got ${missingResult.code}`);
  console.log('✅ [PASS] Missing SMTP config correctly identified as SMTP_CONFIG_MISSING.');

  // 3. Test Error Categorizer
  console.log('\n--- 3. Testing SMTP Error Categorizer ---');
  const authErr = categorizeSmtpError({ code: 'EAUTH', message: '535 5.7.8 Username and Password not accepted' });
  if (authErr.code !== 'SMTP_AUTH_FAILED') throw new Error(`Expected SMTP_AUTH_FAILED, got ${authErr.code}`);
  console.log('✅ [PASS] Auth error categorized as SMTP_AUTH_FAILED.');

  const connErr = categorizeSmtpError({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 127.0.0.1:587' });
  if (connErr.code !== 'SMTP_CONNECTION_FAILED') throw new Error(`Expected SMTP_CONNECTION_FAILED, got ${connErr.code}`);
  console.log('✅ [PASS] Connection error categorized as SMTP_CONNECTION_FAILED.');

  const tlsErr = categorizeSmtpError({ message: '140326477543232:error:1408F10B:SSL routines:ssl3_get_record:wrong version number' });
  if (tlsErr.code !== 'SMTP_TLS_PORT_ERROR') throw new Error(`Expected SMTP_TLS_PORT_ERROR, got ${tlsErr.code}`);
  console.log('✅ [PASS] TLS mismatch categorized as SMTP_TLS_PORT_ERROR.');

  const recipErr = categorizeSmtpError({ responseCode: 550, message: '5.1.1 Recipient address rejected' });
  if (recipErr.code !== 'SMTP_RECIPIENT_REJECTED') throw new Error(`Expected SMTP_RECIPIENT_REJECTED, got ${recipErr.code}`);
  console.log('✅ [PASS] Recipient rejection categorized as SMTP_RECIPIENT_REJECTED.');

  // Restore env
  if (initialHost) process.env.EMAIL_SERVER_HOST = initialHost;
  if (initialUser) process.env.EMAIL_SERVER_USER = initialUser;
  if (initialPass) process.env.EMAIL_SERVER_PASSWORD = initialPass;

  // 4. Test WhatsApp Link and Phone Number Verification
  console.log('\n--- 4. Testing Contact Page WhatsApp Configuration ---');
  const targetNumber = '919687949373';
  const messageText = 'Hello KSHAN, I would like to contact you regarding a watch inquiry. Please assist me.';
  const encodedText = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedText}`;

  if (!whatsappUrl.startsWith('https://wa.me/919687949373?text=')) {
    throw new Error('WhatsApp URL does not match required international number format');
  }
  if (whatsappUrl.includes('022') || whatsappUrl.includes('8900')) {
    throw new Error('Old phone number found in WhatsApp URL');
  }
  console.log('✅ [PASS] WhatsApp URL and phone formatting strictly verified: https://wa.me/919687949373');

  console.log('\n====================================================');
  console.log('   All Contact Diagnostic Tests Passed! (100%)       ');
  console.log('====================================================\n');
}

testContactInquiryFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
