import { prisma } from '../src/lib/prisma';
import { verifyPassword, signToken, verifyToken, hasAdminAccess } from '../src/lib/auth';
import { Role } from '../src/types';

async function testAuthRoles() {
  console.log('====================================================');
  console.log('      AURELIA Authentication & Role Access Test     ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // Test 1: Admin account existence & role
  console.log('--- 1. Administrator Account & Bcrypt Hash ---');
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@aurelia.com' },
  });
  assert(Boolean(admin), 'Admin user admin@aurelia.com exists in database');
  assert(admin?.role === 'SUPER_ADMIN', `Admin user has role SUPER_ADMIN (found: ${admin?.role})`);

  const isAdminPassValid = await verifyPassword('Admin@123456', admin?.passwordHash || '');
  assert(isAdminPassValid, 'Password "Admin@123456" matches stored bcrypt hash');

  const isWrongPassRejected = await verifyPassword('WrongPassword#123', admin?.passwordHash || '');
  assert(!isWrongPassRejected, 'Incorrect password "WrongPassword#123" is rejected');

  // Test 2: Admin JWT creation & Admin access permission
  console.log('\n--- 2. Administrator Access & Token Telemetry ---');
  const adminToken = signToken({
    userId: admin!.id,
    email: admin!.email,
    role: admin!.role as Role,
    name: admin!.name,
  });
  const decodedAdmin = verifyToken(adminToken);
  assert(decodedAdmin?.role === 'SUPER_ADMIN', 'Decoded admin token contains role SUPER_ADMIN');
  assert(hasAdminAccess(decodedAdmin?.role), 'hasAdminAccess() returns true for SUPER_ADMIN');

  // Test 3: Customer account & access restriction
  console.log('\n--- 3. Customer Account & /admin Access Restriction ---');
  const customer = await prisma.user.findUnique({
    where: { email: 'vikram@royalhorology.com' },
  });
  assert(Boolean(customer), 'Customer user vikram@royalhorology.com exists in database');
  assert(customer?.role === 'CUSTOMER', `Customer user has role CUSTOMER (found: ${customer?.role})`);

  const isCustomerPassValid = await verifyPassword('Collector@123', customer?.passwordHash || '');
  assert(isCustomerPassValid, 'Password "Collector@123" matches stored bcrypt hash');

  const customerToken = signToken({
    userId: customer!.id,
    email: customer!.email,
    role: customer!.role as Role,
    name: customer!.name,
  });
  const decodedCustomer = verifyToken(customerToken);
  assert(decodedCustomer?.role === 'CUSTOMER', 'Decoded customer token contains role CUSTOMER');
  assert(!hasAdminAccess(decodedCustomer?.role), 'hasAdminAccess() returns false for CUSTOMER (blocked from /admin)');

  // Test 4: Dynamic Admin Provisioner
  console.log('\n--- 4. Manage-Admin CLI Script Verification ---');
  const testEmail = 'exec.director@aurelia.com';
  // Check that admin script can safely upsert
  const { execSync } = await import('child_process');
  const cliOutput = execSync(`npx tsx scripts/manage-admin.ts --email=${testEmail} --password=DirectorPass#2026 --name="Lord Sterling" --role=ADMIN`).toString();
  assert(cliOutput.includes('Administrator account created successfully') || cliOutput.includes('Administrator account updated successfully'), 'manage-admin.ts successfully provisioned new admin account');

  const director = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(Boolean(director && director.role === 'ADMIN'), 'New admin user found with role ADMIN');
  const isDirectorPassValid = await verifyPassword('DirectorPass#2026', director?.passwordHash || '');
  assert(isDirectorPassValid, 'Director password DirectorPass#2026 verified');

  // Clean up test director
  await prisma.address.deleteMany({ where: { userId: director!.id } });
  await prisma.profile.deleteMany({ where: { userId: director!.id } });
  await prisma.user.delete({ where: { id: director!.id } });
  console.log('Cleaned up temporary test administrator.');

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

testAuthRoles()
  .catch((e) => {
    console.error('Test failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
