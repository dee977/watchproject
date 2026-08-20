async function inspectLiveHtml() {
  const url = 'https://watchproject788.onrender.com/product/tissot-chronograph-black-brown-leather';
  console.log('Fetching:', url);
  const res = await fetch(url);
  const html = await res.text();
  
  const matches = Array.from(html.matchAll(/src="([^"]+)"/g)).map(m => m[1]);
  console.log('All img src attributes found in HTML:');
  for (const src of matches) {
    if (src.includes('image') || src.includes('http') || src.includes('_next')) {
      console.log('  ->', src);
      if (src.startsWith('/_next/image?url=')) {
        const parsed = new URL(src, 'https://watchproject788.onrender.com');
        const originalUrl = parsed.searchParams.get('url');
        console.log('     Decoded original URL:', originalUrl);
        
        // Test fetching the _next/image endpoint directly
        const testNextRes = await fetch(parsed.toString());
        console.log('     Next.js image optimizer HTTP status:', testNextRes.status);
        if (testNextRes.status !== 200) {
          const errBody = await testNextRes.text();
          console.log('     Optimizer response body:', errBody);
        }
        
        // Test fetching the upstream URL directly
        if (originalUrl) {
          try {
            const upstreamRes = await fetch(originalUrl);
            console.log('     Upstream HTTP status:', upstreamRes.status, 'Content-Type:', upstreamRes.headers.get('content-type'));
          } catch (e: any) {
            console.log('     Upstream fetch error:', e.message);
          }
        }
      }
    }
  }
}

inspectLiveHtml().catch(console.error);
