async function testDirectOptimizer() {
  const supabaseUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp%20Image%202026-08-18%20at%208.40.47%20PM.jpeg';
  const optimizerUrl = `http://localhost:3000/_next/image?url=${encodeURIComponent(supabaseUrl)}&w=1080&q=75`;

  console.log(`Requesting Image Optimizer: ${optimizerUrl}`);
  const optRes = await fetch(optimizerUrl);
  console.log(`Optimizer HTTP Status: ${optRes.status}`);
  console.log(`Optimizer Content-Type: ${optRes.headers.get('content-type')}`);
  console.log(`Optimizer Content-Length: ${optRes.headers.get('content-length')} bytes`);

  if (optRes.status === 200) {
    console.log('✅ Image optimizer responded 200 OK with optimized image!');
  } else {
    const text = await optRes.text();
    console.log('Response body:', text);
  }
}

testDirectOptimizer().catch(console.error);
