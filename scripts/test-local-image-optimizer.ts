async function testLocalImageOptimizer() {
  console.log('Testing local Next.js image optimizer on http://localhost:3000 ...');

  // 1. Fetch product page
  const pageUrl = 'http://localhost:3000/product/tissot-chronograph-black-brown-leather';
  console.log(`Fetching HTML page: ${pageUrl}`);
  const res = await fetch(pageUrl);
  console.log(`Page HTTP Status: ${res.status}`);

  // 2. Test direct Next.js Image Optimization on Supabase image
  const supabaseUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp%20Image%202026-08-18%20at%208.40.47%20PM.jpeg';
  const optimizerUrl = `http://localhost:3000/_next/image?url=${encodeURIComponent(supabaseUrl)}&w=1080&q=75`;

  console.log(`Testing Image Optimizer URL: ${optimizerUrl}`);
  const optRes = await fetch(optimizerUrl);
  console.log(`Optimizer HTTP Status: ${optRes.status}`);
  console.log(`Optimizer Content-Type: ${optRes.headers.get('content-type')}`);
  console.log(`Optimizer Content-Length: ${optRes.headers.get('content-length')} bytes`);

  if (optRes.status !== 200) {
    const body = await optRes.text();
    console.error('Optimizer Error Body:', body);
    throw new Error(`Optimizer failed with status ${optRes.status}`);
  }

  console.log('\n🎉 SUCCESS: Local Next.js Image Optimization returned HTTP 200 OK for Supabase image!');
}

testLocalImageOptimizer().catch((e) => {
  console.error('Local test failed:', e);
  process.exit(1);
});
