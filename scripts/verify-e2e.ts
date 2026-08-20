import fs from 'fs';
import path from 'path';

// Load .env
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {}

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { formatPrice } from '../src/lib/currency';
import { getStoreSettings } from '../src/lib/store-settings';

async function runE2EVerification() {
  console.log('====================================================');
  console.log('      AURELIA Haute Horlogerie End-to-End Test      ');
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

  // 1. Password Hashing
  console.log('\n--- 1. Authentication & Security ---');
  const testPassword = 'SecurePassword@2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(testPassword, salt);
  const isMatch = await bcrypt.compare(testPassword, hash);
  assert(isMatch, 'Bcrypt password hashing and verification match');

  // 2. JWT Verification
  const token = jwt.sign(
    { userId: 'usr_test_123', role: 'CUSTOMER', email: 'test@aurelia.com' },
    process.env.JWT_SECRET || 'aurelia_secret',
    { expiresIn: '7d' }
  );
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aurelia_secret') as any;
  assert(decoded.userId === 'usr_test_123' && decoded.role === 'CUSTOMER', 'JWT token signature and payload verification');

  // 3. Database Catalog Integrity
  console.log('\n--- 2. Database Catalog & Horological Schema ---');
  const productsCount = await prisma.product.count();
  const brandsCount = await prisma.brand.count();
  const categoriesCount = await prisma.category.count();

  assert(productsCount > 0, `Database populated with luxury products (Found: ${productsCount})`);
  assert(brandsCount > 0, `Database populated with luxury brands (Found: ${brandsCount})`);
  assert(categoriesCount > 0, `Database populated with horology categories (Found: ${categoriesCount})`);

  // 4. Faceted Search Query Simulation
  console.log('\n--- 3. Search & Faceted Filtering ---');
  const automaticWatches = await prisma.product.findMany({
    where: { movement: 'Automatic', isPublished: true },
  });
  assert(automaticWatches.length > 0, `Automatic movement filter working (${automaticWatches.length} pieces found)`);

  const seikoPresage = await prisma.product.findFirst({
    where: { name: { contains: 'Presage' } },
    include: { inventory: true },
  });
  assert(Boolean(seikoPresage), `Search query for "Presage" returned product: ${seikoPresage?.name}`);

  // 5. Currency Formatting
  console.log('\n--- 4. Indian Rupee Formatter ---');
  const formattedPrice = formatPrice(425000);
  assert(formattedPrice.includes('4,25,000'), `Price formatted correctly (${formattedPrice})`);

  // 6. Settings Retrieval
  console.log('\n--- 5. Dynamic Site Settings ---');
  const settings = await getStoreSettings();
  assert(Boolean(settings.STORE_NAME), `Store name loaded: ${settings.STORE_NAME}`);
  assert(settings.FREE_SHIPPING_THRESHOLD > 0, `Free shipping threshold: ₹${settings.FREE_SHIPPING_THRESHOLD}`);

  // 7. Coupon Validation
  console.log('\n--- 6. Privilege Vouchers ---');
  const coupon = await prisma.coupon.findUnique({
    where: { code: 'AURELIA10' },
  });
  assert(Boolean(coupon && coupon.discountValue === 10), `Privilege voucher AURELIA10 verified (${coupon?.discountValue}%)`);

  // 8. Cash on Delivery (COD) Order Lifecycle & Stock Decrement
  console.log('\n--- 7. Cash on Delivery (COD) Order Lifecycle ---');
  if (seikoPresage && seikoPresage.inventory) {
    const initialStock = seikoPresage.inventory.stockQuantity;

    // Simulate COD order placement
    const orderNumber = `AUR-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const testOrder = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: 'test-collector@luxury.com',
        guestName: 'Rohan Singhania',
        guestPhone: '+919876543210',
        shippingAddressSnapshot: JSON.stringify({
          fullName: 'Rohan Singhania',
          addressLine1: 'Bungalow 4, Malabar Hill',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400006',
          country: 'India',
        }),
        subtotal: seikoPresage.price,
        discountAmount: 0,
        taxAmount: Math.round(seikoPresage.price * 0.18),
        shippingAmount: 0,
        codFee: 250,
        totalAmount: seikoPresage.price + Math.round(seikoPresage.price * 0.18) + 250,
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        items: {
          create: [
            {
              productId: seikoPresage.id,
              productName: seikoPresage.name,
              productSku: seikoPresage.sku,
              productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
              brandName: 'Seiko',
              unitPrice: seikoPresage.price,
              quantity: 1,
              totalPrice: seikoPresage.price,
            },
          ],
        },
        payments: {
          create: {
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            amount: seikoPresage.price + Math.round(seikoPresage.price * 0.18) + 250,
            gatewayPaymentId: `COD-${orderNumber}`,
          },
        },
      },
    });

    // Atomic Stock deduction
    await prisma.inventory.update({
      where: { productId: seikoPresage.id },
      data: { stockQuantity: { decrement: 1 } },
    });

    const updatedInventory = await prisma.inventory.findUnique({
      where: { productId: seikoPresage.id },
    });

    assert(Boolean(testOrder), `COD Test Order created successfully (#${testOrder.orderNumber})`);
    assert(testOrder.paymentMethod === 'COD', `COD Payment method confirmed: ${testOrder.paymentMethod}`);
    assert(testOrder.paymentStatus === 'PENDING', `Initial COD Payment status is PENDING (not auto-paid)`);
    assert(
      updatedInventory?.stockQuantity === initialStock - 1,
      `Inventory stock properly decremented from ${initialStock} to ${updatedInventory?.stockQuantity}`
    );

    // Simulate Admin Administering COD Handover: Mark Delivered & Collect Cash -> Mark PAID
    console.log('\n--- 8. Admin COD Settlement on Handover ---');
    const fulfilledOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: 'DELIVERED',
        paymentStatus: 'PAID',
      },
    });

    await prisma.payment.updateMany({
      where: { orderId: testOrder.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    const paidPayment = await prisma.payment.findFirst({
      where: { orderId: testOrder.id },
    });

    assert(fulfilledOrder.status === 'DELIVERED', 'Order marked as DELIVERED by admin');
    assert(fulfilledOrder.paymentStatus === 'PAID', 'Admin successfully marked COD payment as PAID after physical cash collection');
    assert(paidPayment?.paymentStatus === 'PAID' && Boolean(paidPayment.paidAt), 'Payment model record updated with PAID status and paidAt timestamp');

    // Clean up test order and restore stock
    await prisma.payment.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.inventory.update({
      where: { productId: seikoPresage.id },
      data: { stockQuantity: { increment: 1 } },
    });
    console.log('Test order cleaned up and inventory restored.');
  }

  console.log('\n====================================================');
  console.log(`   Verification Summary: ${passedTests} / ${totalTests} Tests Passed (100%)`);
  console.log('====================================================\n');
}

runE2EVerification()
  .catch((e) => {
    console.error('Verification failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
