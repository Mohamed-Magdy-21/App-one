const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash('123', 10);
  const hashedCashier = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedAdmin },
    create: {
      username: 'admin',
      password: hashedAdmin,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'cashier1' },
    update: { password: hashedCashier },
    create: {
      username: 'cashier1',
      password: hashedCashier,
      name: 'Cashier One',
      role: 'CASHIER',
    },
  });

  // SQLite doesn't support skipDuplicates; use upsert for each product
  await Promise.all([
    prisma.product.upsert({
      where: { productCode: 'ESP-1001' },
      update: {},
      create: { productCode: 'ESP-1001', name: 'Espresso Shot', price: 3.0, stockQuantity: 30 },
    }),
    prisma.product.upsert({
      where: { productCode: 'CAP-2002' },
      update: {},
      create: { productCode: 'CAP-2002', name: 'Cappuccino', price: 4.5, stockQuantity: 24 },
    }),
    prisma.product.upsert({
      where: { productCode: 'BG-3003' },
      update: {},
      create: { productCode: 'BG-3003', name: 'Fresh Bagel', price: 2.25, stockQuantity: 50 },
    }),
  ]);

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
