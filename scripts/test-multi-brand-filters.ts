import { normalizeParamArray, normalizeParamString } from '../src/lib/utils';
import { prisma } from '../src/lib/prisma';

async function testFilters() {
  console.log('====================================================');
  console.log('   Testing Multi-Brand / Multi-Filter Normalization  ');
  console.log('====================================================');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      throw new Error(`Test failed: ${name}`);
    }
  }

  // 1. Parameter Normalization Unit Tests
  console.log('\n--- 1. Parameter Normalization Unit Tests ---');
  assert(normalizeParamArray(undefined).length === 0, 'undefined -> []');
  assert(normalizeParamArray(null).length === 0, 'null -> []');
  assert(normalizeParamArray('').length === 0, 'empty string -> []');
  
  const single = normalizeParamArray('seiko');
  assert(single.length === 1 && single[0] === 'seiko', 'Single string "seiko" -> ["seiko"]');

  const comma = normalizeParamArray('seiko,citizen');
  assert(comma.length === 2 && comma.includes('seiko') && comma.includes('citizen'), 'Comma string "seiko,citizen" -> ["seiko", "citizen"]');

  const arrayInput = normalizeParamArray(['seiko', 'citizen']);
  assert(arrayInput.length === 2 && arrayInput.includes('seiko') && arrayInput.includes('citizen'), 'Array ["seiko", "citizen"] -> ["seiko", "citizen"]');

  const mixedInput = normalizeParamArray(['seiko,citizen', 'tissot', '  ', 'seiko']);
  assert(mixedInput.length === 3 && mixedInput.includes('seiko') && mixedInput.includes('citizen') && mixedInput.includes('tissot'), 'Mixed and duplicate input deduplicated cleanly');

  // 2. Database Filter Queries
  console.log('\n--- 2. Database Multi-Brand OR Queries ---');

  // Test 1: All products
  const allProducts = await prisma.product.findMany({ where: { isPublished: true } });
  assert(allProducts.length > 0, `All products count: ${allProducts.length}`);

  // Test 2: Only Seiko
  const seikoBrand = normalizeParamArray('seiko');
  const seikoProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      brand: { slug: { in: seikoBrand } },
    },
    include: { brand: true },
  });
  assert(seikoProducts.length > 0 && seikoProducts.every((p) => p.brand.slug === 'seiko'), `Only Seiko returned (${seikoProducts.length} pieces)`);

  // Test 3: Only Citizen
  const citizenBrand = normalizeParamArray('citizen');
  const citizenProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      brand: { slug: { in: citizenBrand } },
    },
    include: { brand: true },
  });
  assert(citizenProducts.length > 0 && citizenProducts.every((p) => p.brand.slug === 'citizen'), `Only Citizen returned (${citizenProducts.length} pieces)`);

  // Test 4: Seiko + Citizen
  const multiBrands = normalizeParamArray(['seiko', 'citizen']);
  const multiProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      brand: { slug: { in: multiBrands } },
    },
    include: { brand: true },
  });
  const expectedCount = seikoProducts.length + citizenProducts.length;
  assert(
    multiProducts.length === expectedCount &&
      multiProducts.every((p) => p.brand.slug === 'seiko' || p.brand.slug === 'citizen'),
    `Seiko + Citizen OR query returned exactly sum of individual brands (${multiProducts.length} pieces)`
  );

  // Test 5: Seiko + Citizen + Tissot
  const threeBrands = normalizeParamArray('seiko,citizen,tissot');
  const threeProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      brand: { slug: { in: threeBrands } },
    },
    include: { brand: true },
  });
  assert(
    threeProducts.length >= multiProducts.length &&
      threeProducts.every((p) => ['seiko', 'citizen', 'tissot'].includes(p.brand.slug)),
    `Seiko + Citizen + Tissot returned ${threeProducts.length} pieces`
  );

  // Test 6: Movement + Multi-Brand + Price Filter Combined
  console.log('\n--- 3. Combined Multi-Facet Queries ---');
  const movements = normalizeParamArray(['Automatic', 'Manual Winding']);
  const combinedProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      brand: { slug: { in: multiBrands } },
      movement: { in: movements },
    },
    include: { brand: true },
  });
  assert(
    combinedProducts.every(
      (p) => (p.brand.slug === 'seiko' || p.brand.slug === 'citizen') && (p.movement === 'Automatic' || p.movement === 'Manual Winding')
    ),
    `Combined Multi-Brand & Multi-Movement filter matched (${combinedProducts.length} pieces)`
  );

  console.log('\n====================================================');
  console.log(`   Filter Test Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

testFilters()
  .catch((e) => {
    console.error('Filter test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
