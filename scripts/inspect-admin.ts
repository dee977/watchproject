import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('--- Inspecting Database Users ---');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      passwordHash: true,
    }
  });

  console.log(`Total users found: ${users.length}`);
  for (const u of users) {
    const isMatch123456 = await bcrypt.compare('Admin@123456', u.passwordHash);
    const isMatch12345 = await bcrypt.compare('Admin@12345', u.passwordHash);
    console.log({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      matches_Admin123456: isMatch123456,
      matches_Admin12345: isMatch12345,
    });
  }

  const targetAdmin = await prisma.user.findUnique({
    where: { email: 'admin@aurelia.com' }
  });
  console.log('Lookup admin@aurelia.com:', targetAdmin ? 'EXISTS' : 'DOES NOT EXIST');
}

main().catch(console.error).finally(() => prisma.$disconnect());
