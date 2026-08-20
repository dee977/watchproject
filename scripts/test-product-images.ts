import {
  getProductImageUrl,
  getPublicImageUrl,
  getProductPrimaryImage,
  getProductSecondaryImage,
  SUPABASE_STORAGE_BASE_URL,
  FALLBACK_WATCH_IMAGE,
  FALLBACK_SECONDARY_WATCH_IMAGE,
} from '../src/lib/images';
import nextConfig from '../next.config.mjs';

async function runImageTestSuite() {
  console.log('====================================================');
  console.log('   KSHAN Product Image System Test Suite            ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // 1. Test next.config.mjs remotePatterns
  console.log('--- 1. Testing Next.js Configuration Remote Patterns ---');
  const remotePatterns = nextConfig.images?.remotePatterns || [];
  const hasExactSupabaseHost = remotePatterns.some(
    (p: any) => p.hostname === 'regucynzyykcqhjvreiw.supabase.co' && p.protocol === 'https'
  );
  assert(hasExactSupabaseHost, 'next.config.mjs allows exact hostname "regucynzyykcqhjvreiw.supabase.co" with HTTPS');

  const hasUnsplash = remotePatterns.some((p: any) => p.hostname === 'images.unsplash.com');
  assert(hasUnsplash, 'next.config.mjs preserves existing "images.unsplash.com" pattern');

  // 2. Test Supabase permanent public URL formatting
  console.log('\n--- 2. Testing Supabase Permanent Public URL Normalization ---');

  // A. Direct filename with spaces
  const filenameWithSpaces = getProductImageUrl('WhatsApp Image 2026-08-18 at 8.37.02 PM.jpeg');
  assert(
    filenameWithSpaces === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/WhatsApp%20Image%202026-08-18%20at%208.37.02%20PM.jpeg',
    'Direct storage filename with spaces safely encoded into valid public Supabase URL'
  );

  // B. Relative path with /image/ prefix
  const relativeResult = getProductImageUrl('image/omega-speedmaster.png');
  assert(
    relativeResult === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/omega-speedmaster.png',
    'Relative path "image/..." stripped and normalized correctly'
  );

  // C. Full public URL preserved with space encoding
  const fullPublicUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/tag-heuer.jpg';
  assert(
    getProductImageUrl(fullPublicUrl) === fullPublicUrl,
    'Existing full public Supabase URL preserved intact'
  );

  // D. Signed URL converted to permanent public URL
  const signedUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/sign/image/rolex-gmt.jpg?token=abc123expired';
  const convertedSigned = getProductImageUrl(signedUrl);
  assert(
    convertedSigned === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/rolex-gmt.jpg',
    'Temporary signed URL correctly stripped and converted to permanent public URL'
  );

  // E. Placeholder replacement (placehold.co rejected)
  const placeholderUrl = 'https://placehold.co/600x600/png?text=Watch';
  const placeholderCleaned = getProductImageUrl(placeholderUrl);
  assert(
    placeholderCleaned === FALLBACK_WATCH_IMAGE,
    'Low-quality placeholder URL (placehold.co) replaced with verified luxury watch image'
  );

  // F. Null / empty fallback
  assert(
    getProductImageUrl(null) === FALLBACK_WATCH_IMAGE && getProductImageUrl('') === FALLBACK_WATCH_IMAGE,
    'Null or empty image string safely falls back to luxury watch image'
  );

  // G. Double prefix unwrap
  const doublePrefix = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/https://images.unsplash.com/photo-1523275335684?w=800';
  const unwrapped = getProductImageUrl(doublePrefix);
  assert(
    unwrapped === 'https://images.unsplash.com/photo-1523275335684?w=800',
    'Accidental double Supabase URL prefix cleanly unwrapped to inner URL'
  );

  // 3. Test Primary & Secondary Image Resolution
  console.log('\n--- 3. Testing Primary & Secondary Image Resolution ---');

  const testImages = [
    { url: 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-secondary.jpg', isPrimary: false, displayOrder: 1 },
    { url: 'watch-primary.jpg', isPrimary: true, displayOrder: 0 },
  ];

  const primary = getProductPrimaryImage(testImages);
  assert(
    primary === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-primary.jpg',
    'Primary image correctly identified by isPrimary flag and normalized'
  );

  const secondary = getProductSecondaryImage(testImages);
  assert(
    secondary === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-secondary.jpg',
    'Secondary image correctly identified for hover transitions'
  );

  const emptyPrimary = getProductPrimaryImage([]);
  assert(
    emptyPrimary === FALLBACK_WATCH_IMAGE,
    'Empty images array falls back gracefully to default luxury timepiece image'
  );

  // 4. Test Array of Strings
  const stringArray = ['watch-1.jpg', 'watch-2.jpg'];
  assert(
    getProductPrimaryImage(stringArray) === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-1.jpg',
    'String array correctly resolves primary item'
  );

  // 5. Test JSON stringified array
  const jsonArray = JSON.stringify(['watch-json-1.jpg', 'watch-json-2.jpg']);
  assert(
    getProductImageUrl(jsonArray) === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/watch-json-1.jpg',
    'JSON stringified array parses and resolves first element'
  );

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runImageTestSuite().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
