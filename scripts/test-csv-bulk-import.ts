import { signToken } from '../src/lib/auth';

async function runCsvBulkImportTestSuite() {
  console.log('====================================================');
  console.log('   KSHAN Admin CSV Bulk Product Ingestion Test Suite ');
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

  // 1. Generate Auth Tokens
  const adminToken = signToken({
    userId: 'usr_admin_test_101',
    email: 'admin@aurelia.com',
    role: 'SUPER_ADMIN',
    name: 'Alexander Vance',
  });

  const customerToken = signToken({
    userId: 'usr_cust_test_202',
    email: 'vikram@royalhorology.com',
    role: 'CUSTOMER',
    name: 'Vikramaditya Roy',
  });

  const { POST, GET } = await import('../src/app/api/admin/import-csv/route');

  // -----------------------------------------------------------
  // Test 1: Price & MRP Format Validation (Reject Currency Symbols & Blank)
  // -----------------------------------------------------------
  console.log('\n--- 1. Testing Price & MRP Format Validation ---');

  const invalidPricesCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-01,"TAG Heuer Carrera","TAG Heuer","Chronograph Watches",,,5,"Automatic","Steel","42 mm","100m","Racing watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-02,"Rolex Submariner","Rolex","Luxury Watches",₹49999,59999,3,"Automatic","Oystersteel","41 mm","300m","Diving watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-03,"Breitling Navitimer","Breitling","Chronograph Watches","49,999","₹59,999",2,"Automatic","Steel","43 mm","30m","Aviation watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-04,"Omega Speedmaster","Omega","Luxury Watches",-5000,60000,1,"Manual","Steel","42 mm","50m","Moonwatch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
`;

  const req1 = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${adminToken}`,
    },
    body: JSON.stringify({ csvData: invalidPricesCsv, dryRun: true }),
  });

  const res1 = await POST(req1 as any);
  const data1 = await res1.json();

  assert(data1.totalRows === 4, 'Dry run accurately counts 4 data rows');
  assert(data1.validCount === 0, '0 rows valid when prices contain blank/currency/commas/negatives');
  assert(data1.invalidCount === 4, 'All 4 rows flagged as invalid');
  assert(
    data1.rows[0].errors.includes('Price is required') && data1.rows[0].errors.includes('MRP is required'),
    'Row 2 correctly identifies missing Price & MRP without silently defaulting to 0'
  );
  assert(
    data1.rows[1].errors.some((e: string) => e.includes('Invalid price number')),
    'Row 3 correctly rejects ₹ symbol in Price (₹49999)'
  );
  assert(
    data1.rows[2].errors.some((e: string) => e.includes('Invalid price number')),
    'Row 4 correctly rejects comma formatting (49,999)'
  );
  assert(
    data1.rows[3].errors.some((e: string) => e.includes('greater than zero')),
    'Row 5 correctly rejects negative price (-5000)'
  );

  // -----------------------------------------------------------
  // Test 2: Full 15-Row Catalog Dry Run Preview (10 Brands, 4 Categories)
  // -----------------------------------------------------------
  console.log('\n--- 2. Testing 15-Row Catalog Validation with 10 Brands & 4 Categories ---');

  const full15RowsCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
KSH-TAG-001,"TAG Heuer Carrera Chrono","TAG Heuer","Chronograph Watches",450000,480000,4,"Automatic","Fine-Brushed Steel","42 mm","100m","Iconic motorsport chronograph with Calibre HEUER02.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-GSS-002,"Guess Continental Chronograph","Guess","Chronograph Watches",22000,25000,8,"Quartz","Stainless Steel","44 mm","50m","Fashion sport luxury chronograph timepiece.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-BRT-003,"Breitling Navitimer B01 43","Breitling","Chronograph Watches",650000,680000,3,"Automatic","Stainless Steel","43 mm","30m","Aviation chronometer with circular slide rule.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-OMG-004,"Omega Seamaster Aqua Terra","Omega","Luxury Watches",520000,560000,5,"Automatic","Oystersteel","41 mm","150m","Master Chronometer tribute to maritime heritage.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-RLX-005,"Rolex Datejust 41","Rolex","Luxury Watches",880000,920000,2,"Automatic","Rolesor","41 mm","100m","Classic benchmark of horological elegance.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-CAS-006,"Casio Edifice Sapphire Chrono","Casio","Sport Watches",18000,21000,10,"Solar Quartz","Stainless Steel","43 mm","100m","High-performance solar powered sports chronometer.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-RLX-007,"Rolex Submariner No Date","Rolex","Luxury Watches",820000,860000,3,"Automatic","Oystersteel","41 mm","300m","The quintessential divers archetype chronometer.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-RLX-008,"Rolex GMT-Master II Pepsi","Rolex","Luxury Watches",1250000,1300000,1,"Automatic","Oystersteel","40 mm","100m","Dual timezone aviation chronometer with Cerachrom bezel.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-RLX-009,"Rolex Cosmograph Daytona","Rolex","Luxury Watches",1650000,1750000,1,"Automatic","Oystersteel","40 mm","100m","Ultimate motor racing sports chronograph.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-RLX-010,"Rolex Oyster Perpetual 36","Rolex","Luxury Watches",580000,620000,4,"Automatic","Oystersteel","36 mm","100m","Purest expression of the Oyster concept.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-AX-011,"Armani Exchange Hampton Chrono","Armani Exchange","Chronograph Watches",16000,19000,6,"Quartz","Stainless Steel","46 mm","50m","Modern minimalist chronograph with gunmetal finish.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-AX-012,"Armani Exchange Outerbanks Diver","Armani Exchange","Chronograph Watches",18500,22000,7,"Quartz","Silicone Strap","44 mm","50m","Dynamic casual sportswear chronograph.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-HB-013,"Hugo Boss Grand Prix Automatic","Hugo Boss","Automatic Watches",36000,40000,5,"Automatic","Stainless Steel","44 mm","50m","Refined executive automatic timepiece.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-VER-014,"Versace Hellenyium Chrono Gold","Versace","Chronograph Watches",88000,98000,3,"Quartz","Gold Plated Steel","42 mm","50m","Haute Italian luxury watch with Medusa relief.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
KSH-TIS-015,"Tissot PR516 Chronograph","Tissot","Chronograph Watches",72000,79000,6,"Manual Wind","Stainless Steel","41 mm","100m","Vintage motorsport inspired mechanical chronograph.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
`;

  const req2 = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${adminToken}`,
    },
    body: JSON.stringify({ csvData: full15RowsCsv, dryRun: true }),
  });

  const res2 = await POST(req2 as any);
  const data2 = await res2.json();

  assert(data2.totalRows === 15, '15-row CSV total rows counted accurately');
  assert(data2.validCount === 15, 'All 15 rows validated as 100% valid (0 errors)');
  assert(data2.invalidCount === 0, 'Invalid rows is 0');
  assert(Array.isArray(data2.newBrands), 'newBrands telemetry array returned');
  assert(Array.isArray(data2.newCategories), 'newCategories telemetry array returned');

  // -----------------------------------------------------------
  // Test 3: Customer Authorization Block (HTTP 403)
  // -----------------------------------------------------------
  console.log('\n--- 3. Testing Security Protection ---');

  const reqCustomer = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${customerToken}`,
    },
    body: JSON.stringify({ csvData: full15RowsCsv, dryRun: true }),
  });

  const resCustomer = await POST(reqCustomer as any);
  assert(resCustomer.status === 403, 'Customer role is strictly denied access with HTTP 403 Forbidden');

  const reqUnauth = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvData: full15RowsCsv, dryRun: true }),
  });

  const resUnauth = await POST(reqUnauth as any);
  assert(resUnauth.status === 403, 'Unauthenticated visitor is strictly denied access with HTTP 403 Forbidden');

  // -----------------------------------------------------------
  // Test 4: ImageUrl Validation
  // -----------------------------------------------------------
  console.log('\n--- 4. Testing ImageUrl Format Validation ---');

  const invalidImageCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-BAD-01,"Watch Name","Rolex","Luxury Watches",50000,60000,1,"Automatic","Steel","40 mm","100m","Description","http://insecure-http.com/image.jpg"
AUR-BAD-02,"Watch Name 2","Rolex","Luxury Watches",50000,60000,1,"Automatic","Steel","40 mm","100m","Description","not-a-url"
`;

  const reqImg = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${adminToken}`,
    },
    body: JSON.stringify({ csvData: invalidImageCsv, dryRun: true }),
  });

  const resImg = await POST(reqImg as any);
  const dataImg = await resImg.json();

  assert(dataImg.invalidCount === 2, 'Non-HTTPS and malformed ImageUrls correctly rejected');
  assert(
    dataImg.rows[0].errors.some((e: string) => e.includes('Invalid ImageUrl')),
    'Insecure HTTP URL rejected in favor of HTTPS'
  );

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runCsvBulkImportTestSuite().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
