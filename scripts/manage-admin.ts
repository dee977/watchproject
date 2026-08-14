import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * AURELIA Admin Account Provisioner & Manager
 * 
 * Safely creates or updates administrator accounts in the database
 * without touching authentication logic or resetting product catalogs.
 * 
 * Usage:
 *   npx tsx scripts/manage-admin.ts
 *   npx tsx scripts/manage-admin.ts --email=newadmin@aurelia.com --password=SecurePass#2026 --name="Alexander Vance" --role=SUPER_ADMIN
 */

async function main() {
  const args = process.argv.slice(2);
  const argMap: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      argMap[key] = rest.join('=');
    }
  }

  const email = (argMap.email || process.env.ADMIN_EMAIL || 'admin@aurelia.com').toLowerCase().trim();
  const password = argMap.password || process.env.ADMIN_PASSWORD || 'Admin@123456';
  const name = argMap.name || process.env.ADMIN_NAME || 'Alexander Vance';
  const role = argMap.role || process.env.ADMIN_ROLE || 'SUPER_ADMIN';

  console.log('====================================================');
  console.log('       AURELIA Admin Account Provisioner CLI        ');
  console.log('====================================================');
  console.log(`Target Email : ${email}`);
  console.log(`Target Name  : ${name}`);
  console.log(`Target Role  : ${role}`);
  console.log(`Password Len : ${password.length} characters`);
  console.log('----------------------------------------------------');

  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} found (ID: ${existingUser.id}). Updating credentials...`);
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        role,
        passwordHash,
        emailVerified: true,
      },
    });

    console.log('✅ Administrator account updated successfully.');
    console.log({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });
  } else {
    console.log(`User ${email} does not exist. Provisioning new administrator account...`);
    const created = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        emailVerified: true,
        profile: {
          create: {
            bio: 'Managing Director & Master Horologist at AURELIA.',
            preferredCurrency: 'INR',
          },
        },
        addresses: {
          create: {
            fullName: name,
            phone: '+91 98201 12345',
            addressLine1: 'Penthouse 14, Imperial Towers',
            addressLine2: 'Altamount Road, Cumballa Hill',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400026',
            country: 'India',
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        },
      },
    });

    console.log('✅ Administrator account created successfully.');
    console.log({
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
    });
  }

  // Verification test
  const checkUser = await prisma.user.findUnique({ where: { email } });
  if (checkUser) {
    const isPasswordValid = await bcrypt.compare(password, checkUser.passwordHash);
    console.log('\n--- Cryptographic Verification ---');
    console.log(`Bcrypt Verification against stored hash: ${isPasswordValid ? '✅ MATCH' : '❌ FAILED'}`);
    console.log('Ready for immediate login at /login');
  }

  console.log('====================================================\n');
}

main()
  .catch((err) => {
    console.error('Error managing admin account:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
