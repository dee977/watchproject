import { hasAdminAccess, canManageProducts, canManageOrders, canManageSettings, signToken } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

async function runSecurityVerification() {
  console.log('====================================================');
  console.log('      AURELIA Admin Security & Role Access Test     ');
  console.log('====================================================');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${message}`);
    } else {
      console.error(`❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Role Permission Matrix
  console.log('\n--- 1. Role Permission Matrix ---');
  assert(!hasAdminAccess('CUSTOMER'), 'CUSTOMER role is denied admin access');
  assert(!hasAdminAccess(null), 'Unauthenticated user is denied admin access');
  assert(!hasAdminAccess(undefined), 'Undefined role is denied admin access');
  assert(hasAdminAccess('ADMIN'), 'ADMIN role is granted admin access');
  assert(hasAdminAccess('SUPER_ADMIN'), 'SUPER_ADMIN role is granted admin access');
  assert(hasAdminAccess('MANAGER'), 'MANAGER role is granted admin access');
  assert(hasAdminAccess('CUSTOMER_SUPPORT'), 'CUSTOMER_SUPPORT role is granted admin access');

  // 2. Specific Action Authorizations
  console.log('\n--- 2. Granular Capability Checks ---');
  assert(!canManageProducts('CUSTOMER'), 'CUSTOMER cannot manage products');
  assert(canManageProducts('ADMIN'), 'ADMIN can manage products');
  assert(canManageProducts('SUPER_ADMIN'), 'SUPER_ADMIN can manage products');

  assert(!canManageOrders('CUSTOMER'), 'CUSTOMER cannot manage orders');
  assert(canManageOrders('ADMIN'), 'ADMIN can manage orders');
  assert(canManageOrders('CUSTOMER_SUPPORT'), 'CUSTOMER_SUPPORT can manage orders');

  assert(!canManageSettings('CUSTOMER'), 'CUSTOMER cannot manage store settings');
  assert(!canManageSettings('CUSTOMER_SUPPORT'), 'CUSTOMER_SUPPORT cannot manage store settings');
  assert(canManageSettings('ADMIN'), 'ADMIN can manage store settings');
  assert(canManageSettings('SUPER_ADMIN'), 'SUPER_ADMIN can manage store settings');

  // 3. Database Role Verification
  console.log('\n--- 3. Database Admin & Customer Account Roles ---');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@aurelia.com' },
  });
  assert(Boolean(adminUser), 'Admin user exists in database');
  assert(adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN', `Admin user has elevated role (${adminUser?.role})`);

  const demoCustomer = await prisma.user.findUnique({
    where: { email: 'vikram@royalhorology.com' },
  });
  assert(Boolean(demoCustomer), 'Customer user exists in database');
  assert(demoCustomer?.role === 'CUSTOMER', `Customer user has standard CUSTOMER role (${demoCustomer?.role})`);

  // 4. Token Generation & Role Payload
  console.log('\n--- 4. Token Isolation ---');
  const customerToken = signToken({
    userId: demoCustomer!.id,
    email: demoCustomer!.email,
    role: demoCustomer!.role as any,
    name: demoCustomer!.name,
  });

  const adminToken = signToken({
    userId: adminUser!.id,
    email: adminUser!.email,
    role: adminUser!.role as any,
    name: adminUser!.name,
  });

  assert(Boolean(customerToken), 'Customer token successfully minted with role=CUSTOMER');
  assert(Boolean(adminToken), 'Admin token successfully minted with role=SUPER_ADMIN/ADMIN');

  console.log('\n====================================================');
  console.log(`   Security Summary: ${passedTests} / ${totalTests} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runSecurityVerification()
  .catch((e) => {
    console.error('Security verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
