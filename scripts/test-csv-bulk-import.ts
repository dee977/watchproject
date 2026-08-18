import { signToken } from '../src/lib/auth';

// Function unit test & integration verification
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

  // 1. Role Tokens
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

  // -----------------------------------------------------------
  // Test 1: Price & MRP Validation (Reject Currency Symbols & Blank)
  // -----------------------------------------------------------
  console.log('\n--- 1. Testing Price & MRP Format Validation ---');

  const invalidPricesCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-01,"TAG Heuer Carrera","TAG Heuer","Chronograph Watches",,,5,"Automatic","Steel","42 mm","100m","Racing watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-02,"Rolex Submariner","Rolex","Luxury Watches",₹49999,59999,3,"Automatic","Oystersteel","41 mm","300m","Diving watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-03,"Breitling Navitimer","Breitling","Chronograph Watches","49,999","₹59,999",2,"Automatic","Steel","43 mm","30m","Aviation watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-04,"Omega Speedmaster","Omega","Luxury Watches",-5000,60000,1,"Manual","Steel","42 mm","50m","Moonwatch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
`;

  const { POST } = await import('../src/app/api/admin/import-csv/route');

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
  // Test 2: Auto Brand & Category Discovery Notices in Dry Run
  // -----------------------------------------------------------
  console.log('\n--- 2. Testing Brand & Category Auto-Creation Telemetry ---');

  const multiBrandCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-TAG-01,"TAG Heuer Carrera","TAG Heuer","Chronograph Watches",450000,500000,5,"Automatic","Steel","42 mm","100m","Racing chronometer","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-GSS-01,"Guess Horizon Chrono","Guess","Sport Watches",25000,28000,8,"Quartz","Steel","44 mm","50m","Fashion sport watch","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-BRT-01,"Breitling Navitimer B01","Breitling","Chronograph Watches",620000,650000,3,"Automatic","Steel","43 mm","30m","Aviation chronometer","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-OMG-01,"Omega Seamaster 300M","Omega","Luxury Watches",540000,580000,4,"Automatic","Steel","42 mm","300m","Master Chronometer Diver","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-RLX-01,"Rolex Submariner Date","Rolex","Luxury Watches",850000,900000,2,"Automatic","Oystersteel","41 mm","300m","Iconic Diver","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-CAS-01,"Casio G-Shock MR-G","Casio","Sport Watches",180000,200000,6,"Solar Quartz","Titanium","49 mm","200m","Indestructible Flagship","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-AX-01,"Armani Exchange Outerbanks","Armani Exchange","Chronograph Watches",18000,22000,10,"Quartz","Silicone","44 mm","50m","Urban sports chronograph","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-HB-01,"Hugo Boss Grand Prix","Hugo Boss","Automatic Watches",38000,42000,5,"Automatic","Steel","44 mm","50m","Executive timepiece","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-VER-01,"Versace Hellenyium","Versace","Chronograph Watches",85000,95000,4,"Quartz","Gold IP Steel","42 mm","50m","Italian luxury chronograph","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-TIS-01,"Tissot PRX Powermatic 80","Tissot","Automatic Watches",68000,75000,7,"Automatic","316L Steel","40 mm","100m","Integrated bracelet classic","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
`;

  const req2 = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${adminToken}`,
    },
    body: JSON.stringify({ csvData: multiBrandCsv, dryRun: true }),
  });

  const res2 = await POST(req2 as any);
  const data2 = await res2.json();

  assert(data2.totalRows === 10, '10 catalog rows parsed successfully');
  assert(data2.validCount === 10, 'All 10 rows are 100% valid with valid Price & MRP');
  assert(data2.invalidCount === 0, '0 invalid rows (missing brands/categories are no longer treated as errors)');
  assert(Array.isArray(data2.newBrands), 'newBrands list returned in telemetry');
  assert(Array.isArray(data2.newCategories), 'newCategories list returned in telemetry');

  // -----------------------------------------------------------
  // Test 3: Customer Authorization Rejection (Security Test)
  // -----------------------------------------------------------
  console.log('\n--- 3. Testing Customer Unauthorized Access Rejection ---');

  const reqCustomer = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `aurelia_auth_token=${customerToken}`,
    },
    body: JSON.stringify({ csvData: multiBrandCsv, dryRun: true }),
  });

  const resCustomer = await POST(reqCustomer as any);
  assert(resCustomer.status === 403, 'Customer role is strictly denied access with HTTP 403 Forbidden');

  // Unauthenticated user test
  const reqUnauth = new Request('http://localhost:3000/api/admin/import-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvData: multiBrandCsv, dryRun: true }),
  });

  const resUnauth = await POST(reqUnauth as any);
  assert(resUnauth.status === 403, 'Unauthenticated user is strictly denied access with HTTP 403 Forbidden');

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
    'HTTP URL rejected in favor of HTTPS'
  );

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runCsvBulkImportTestSuite().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
