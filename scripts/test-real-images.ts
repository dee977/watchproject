async function testImages() {
  const files = [
    'WhatsApp Image 2026-08-18 at 8.37.02 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.01 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.00 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.36.57 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.36.50 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.36.58 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.03 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.36.39 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.36.49 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.04 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.07 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.10 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.08 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.37.06 PM.jpeg',
    'WhatsApp Image 2026-08-18 at 8.40.47 PM.jpeg',
  ];

  for (const f of files) {
    const rawUrl = `https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/${f}`;
    const encodedUrl = `https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/${encodeURIComponent(f)}`;
    
    const resRaw = await fetch(rawUrl, { method: 'HEAD' });
    const resEnc = await fetch(encodedUrl, { method: 'HEAD' });
    console.log(`File: "${f}"`);
    console.log(`  Raw URL status: ${resRaw.status}, size: ${resRaw.headers.get('content-length')}, type: ${resRaw.headers.get('content-type')}`);
    console.log(`  Encoded URL status: ${resEnc.status}, size: ${resEnc.headers.get('content-length')}`);
  }
}

testImages().catch(console.error);
