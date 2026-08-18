import {
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

  // A. Direct filename
  const filenameResult = getPublicImageUrl('rolex-submariner.jpg');
  assert(
    filenameResult === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/rolex-submariner.jpg',
    'Direct storage filename converted to full permanent public Supabase URL'
  );

  // B. Relative path with /image/ prefix
  const relativeResult = getPublicImageUrl('image/omega-speedmaster.png');
  assert(
    relativeResult === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/omega-speedmaster.png',
    'Relative path "image/..." stripped and normalized correctly'
  );

  // C. Full public URL preserved
  const fullPublicUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/tag-heuer.jpg';
  assert(
    getPublicImageUrl(fullPublicUrl) === fullPublicUrl,
    'Existing full public Supabase URL preserved intact'
  );

  // D. Signed URL converted to permanent public URL
  const signedUrl = 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/sign/image/rolex-gmt.jpg?token=abc123expired';
  const convertedSigned = getPublicImageUrl(signedUrl);
  assert(
    convertedSigned === 'https://regucynzyykcqhjvreiw.supabase.co/storage/v1/object/public/image/rolex-gmt.jpg',
    'Temporary signed URL correctly stripped and converted to permanent public URL'
  );

  // E. Placeholder replacement (placehold.co rejected)
  const placeholderUrl = 'https://placehold.co/600x600/png?text=Watch';
  const placeholderCleaned = getPublicImageUrl(placeholderUrl);
  assert(
    placeholderCleaned === FALLBACK_WATCH_IMAGE,
    'Low-quality placeholder URL (placehold.co) replaced with verified luxury watch image'
  );

  // F. Null / empty fallback
  assert(
    getPublicImageUrl(null) === FALLBACK_WATCH_IMAGE && getPublicImageUrl('') === FALLBACK_WATCH_IMAGE,
    'Null or empty image string safely falls back to luxury watch image'
  );

  // 3. Test Primary & Secondary Image Extraction
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

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runImageTestSuite().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
