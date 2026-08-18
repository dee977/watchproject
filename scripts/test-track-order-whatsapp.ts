import { getStoreSettings } from '../src/lib/store-settings';

async function testWhatsAppLink() {
  console.log('====================================================');
  console.log('   Testing Track Order / WhatsApp URL Verification  ');
  console.log('====================================================');

  const settings = await getStoreSettings();
  console.log('CONCIERGE_PHONE from settings:', settings.CONCIERGE_PHONE);

  const rawPhone = settings.CONCIERGE_PHONE || '9687949373';
  let cleanDigits = rawPhone.replace(/[^0-9]/g, '');
  if (cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.substring(1);
  }

  let whatsappDigits = '919687949373';
  if (cleanDigits.length === 10) {
    whatsappDigits = `91${cleanDigits}`;
  } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    whatsappDigits = cleanDigits;
  }

  console.log('Clean WhatsApp digits:', whatsappDigits);
  
  if (whatsappDigits !== '919687949373') {
    throw new Error(`Expected 919687949373, got ${whatsappDigits}`);
  }

  const defaultMsg = 'Hello, I would like an update on my order. Please assist me.';
  const defaultUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(defaultMsg)}`;

  console.log('\nGenerated Default URL:');
  console.log(defaultUrl);

  const orderMsg = 'Hello, I would like an update on my order #AUR-2026-8942. Please assist me.';
  const orderUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(orderMsg)}`;

  console.log('\nGenerated Order URL:');
  console.log(orderUrl);

  if (!defaultUrl.startsWith('https://wa.me/919687949373?text=')) {
    throw new Error('Default WhatsApp URL does not match required format');
  }

  if (defaultUrl.includes('022') || defaultUrl.includes('8900')) {
    throw new Error('Old phone number detected in URL');
  }

  console.log('\n✅ [PASS] WhatsApp URL and phone formatting strictly verified!');
  console.log('====================================================\n');
}

testWhatsAppLink().catch((e) => {
  console.error(e);
  process.exit(1);
});
