import { prisma } from '../src/lib/prisma';
import AdminDashboardPage from '../src/app/admin/page';
import AdminProductsPage from '../src/app/admin/products/page';
import AdminOrdersPage from '../src/app/admin/orders/page';
import AdminInventoryPage from '../src/app/admin/inventory/page';
import AdminAnalyticsPage from '../src/app/admin/analytics/page';
import AdminCustomersPage from '../src/app/admin/customers/page';
import AdminCouponsPage from '../src/app/admin/coupons/page';
import AdminQuestionsPage from '../src/app/admin/questions/page';
import AdminReviewsPage from '../src/app/admin/reviews/page';
import AdminReturnsPage from '../src/app/admin/returns/page';

async function runAdminRouteTests() {
  console.log('====================================================');
  console.log('   KSHAN Admin Server Component Resilience Test     ');
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

  // 1. Test Prisma Singleton
  console.log('--- 1. Testing Prisma Singleton Integrity ---');
  const globalAny = globalThis as any;
  assert(globalAny.prisma !== undefined, 'globalThis.prisma is defined and assigned universally');
  assert(globalAny.prisma === prisma, 'Exported prisma instance strictly equals globalThis.prisma singleton');

  // 2. Test Admin Dashboard Page Server Component (even if DB is cold/offline)
  console.log('\n--- 2. Testing Admin Dashboard Server Component ---');
  try {
    const dashboardJsx = await AdminDashboardPage();
    assert(dashboardJsx !== null && dashboardJsx !== undefined, 'AdminDashboardPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminDashboardPage threw uncaught exception: ${err.message}`);
  }

  // 3. Test Admin Products Page Server Component
  console.log('\n--- 3. Testing Admin Products Server Component ---');
  try {
    const productsJsx = await AdminProductsPage({ searchParams: {} });
    assert(productsJsx !== null && productsJsx !== undefined, 'AdminProductsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminProductsPage threw uncaught exception: ${err.message}`);
  }

  // 4. Test Admin Orders Page Server Component
  console.log('\n--- 4. Testing Admin Orders Server Component ---');
  try {
    const ordersJsx = await AdminOrdersPage({ searchParams: {} });
    assert(ordersJsx !== null && ordersJsx !== undefined, 'AdminOrdersPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminOrdersPage threw uncaught exception: ${err.message}`);
  }

  // 5. Test Admin Inventory Page Server Component
  console.log('\n--- 5. Testing Admin Inventory Server Component ---');
  try {
    const inventoryJsx = await AdminInventoryPage();
    assert(inventoryJsx !== null && inventoryJsx !== undefined, 'AdminInventoryPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminInventoryPage threw uncaught exception: ${err.message}`);
  }

  // 6. Test Admin Analytics Page Server Component
  console.log('\n--- 6. Testing Admin Analytics Server Component ---');
  try {
    const analyticsJsx = await AdminAnalyticsPage();
    assert(analyticsJsx !== null && analyticsJsx !== undefined, 'AdminAnalyticsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminAnalyticsPage threw uncaught exception: ${err.message}`);
  }

  // 7. Test Admin Customers Page Server Component
  console.log('\n--- 7. Testing Admin Customers Server Component ---');
  try {
    const customersJsx = await AdminCustomersPage();
    assert(customersJsx !== null && customersJsx !== undefined, 'AdminCustomersPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminCustomersPage threw uncaught exception: ${err.message}`);
  }

  // 8. Test Admin Coupons Page Server Component
  console.log('\n--- 8. Testing Admin Coupons Server Component ---');
  try {
    const couponsJsx = await AdminCouponsPage();
    assert(couponsJsx !== null && couponsJsx !== undefined, 'AdminCouponsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminCouponsPage threw uncaught exception: ${err.message}`);
  }

  // 9. Test Admin Questions Page Server Component
  console.log('\n--- 9. Testing Admin Questions Server Component ---');
  try {
    const questionsJsx = await AdminQuestionsPage();
    assert(questionsJsx !== null && questionsJsx !== undefined, 'AdminQuestionsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminQuestionsPage threw uncaught exception: ${err.message}`);
  }

  // 10. Test Admin Reviews Page Server Component
  console.log('\n--- 10. Testing Admin Reviews Server Component ---');
  try {
    const reviewsJsx = await AdminReviewsPage();
    assert(reviewsJsx !== null && reviewsJsx !== undefined, 'AdminReviewsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminReviewsPage threw uncaught exception: ${err.message}`);
  }

  // 11. Test Admin Returns Page Server Component
  console.log('\n--- 11. Testing Admin Returns Server Component ---');
  try {
    const returnsJsx = await AdminReturnsPage();
    assert(returnsJsx !== null && returnsJsx !== undefined, 'AdminReturnsPage executes and returns JSX without throwing');
  } catch (err: any) {
    assert(false, `AdminReturnsPage threw uncaught exception: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runAdminRouteTests().catch((e) => {
  console.error('Admin test suite failed:', e);
  process.exit(1);
});
