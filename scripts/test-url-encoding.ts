async function testUrlEncoding() {
  const rawWithSpaces = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp Image 2026-08-18 at 8.37.02 PM.jpeg';
  const encoded = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp%20Image%202026-08-18%20at%208.37.02%20PM.jpeg';

  console.log('Testing raw with spaces:');
  const res1 = await fetch(`https://watchproject788.onrender.com/_next/image?url=${encodeURIComponent(rawWithSpaces)}&w=1080&q=75`);
  console.log('Status with raw spaces in url param:', res1.status);
  if (res1.status !== 200) {
    console.log('Response body:', await res1.text());
  }

  console.log('\nTesting encoded:');
  const res2 = await fetch(`https://watchproject788.onrender.com/_next/image?url=${encodeURIComponent(encoded)}&w=1080&q=75`);
  console.log('Status with encoded spaces:', res2.status);
}

testUrlEncoding().catch(console.error);
