async function testRenderOptimizer() {
  const supabaseImgUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp%20Image%202026-08-18%20at%208.37.02%20PM.jpeg';
  const nextImageUrl = `https://watchproject788.onrender.com/_next/image?url=${encodeURIComponent(supabaseImgUrl)}&w=1080&q=75`;

  console.log('Testing Next.js optimizer on Render for Supabase image:');
  console.log('Target URL:', nextImageUrl);

  const res = await fetch(nextImageUrl);
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  const body = await res.text();
  console.log('Body:', body.substring(0, 300));
}

testRenderOptimizer().catch(console.error);
