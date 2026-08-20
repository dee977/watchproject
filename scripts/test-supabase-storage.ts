async function checkUrl(url: string) {
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    console.log(`[${res.status}] ${url}`);
    console.log(`Response: ${text.substring(0, 300)}`);
    return res.status;
  } catch (err: any) {
    console.log(`[ERR] ${url} : ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('Testing Supabase storage GET requests...');
  await checkUrl('https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-1.jpg');
  await checkUrl('https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/products/watch-1.jpg');
  await checkUrl('https://regucynzyykcqhjvreiw.supabase.co/storage/v1/bucket');
}

main().catch(console.error);
