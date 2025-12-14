const { PrismaClient: PrismaClientSQLite } = require('@prisma/client');
const { PrismaClient: PrismaClientPostgres } = require('@prisma/client');

/**
 * Data Migration Script: SQLite to PostgreSQL
 * 
 * This script migrates data from your local SQLite database to Neon PostgreSQL.
 * 
 * IMPORTANT: Before running this script:
 * 1. Backup your SQLite database (pos.db)
 * 2. Set up your Neon PostgreSQL database
 * 3. Update DATABASE_URL in .env to point to PostgreSQL
 * 4. Run: npx prisma db push (to create tables in PostgreSQL)
 * 5. Then run: node migrate-data.js
 */

async function migrateData() {
  console.log('🚀 Starting data migration from SQLite to PostgreSQL...\n');

  // Initialize SQLite client (reading from local file)
  const sqlite = new PrismaClientSQLite({
    datasources: {
      db: {
        url: 'file:./pos.db'
      }
    }
  });

  // Initialize PostgreSQL client (using DATABASE_URL from .env)
  const postgres = new PrismaClientPostgres();

  try {
    await sqlite.$connect();
    await postgres.$connect();
    console.log('✅ Connected to both databases\n');

    // Migrate Users
    console.log('📦 Migrating Users...');
    const users = await sqlite.user.findMany();
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // Migrate Products
    console.log('📦 Migrating Products...');
    const products = await sqlite.product.findMany();
    for (const product of products) {
      await postgres.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
    }
    console.log(`✅ Migrated ${products.length} products\n`);

    // Migrate Sales (without soldItems to avoid relation issues)
    console.log('📦 Migrating Sales...');
    const sales = await sqlite.sale.findMany();
    for (const sale of sales) {
      await postgres.sale.upsert({
        where: { id: sale.id },
        update: {
          date: sale.date,
          subtotal: sale.subtotal,
          tax: sale.tax,
          totalAmount: sale.totalAmount,
          createdAt: sale.createdAt,
        },
        create: {
          id: sale.id,
          date: sale.date,
          subtotal: sale.subtotal,
          tax: sale.tax,
          totalAmount: sale.totalAmount,
          createdAt: sale.createdAt,
        },
      });
    }
    console.log(`✅ Migrated ${sales.length} sales\n`);

    // Migrate SoldItems
    console.log('📦 Migrating Sold Items...');
    const soldItems = await sqlite.soldItem.findMany();
    for (const item of soldItems) {
      await postgres.soldItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }
    console.log(`✅ Migrated ${soldItems.length} sold items\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in PostgreSQL database');
    console.log('2. Test your application locally');
    console.log('3. Deploy to production with new DATABASE_URL');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

// Run migration
migrateData();
