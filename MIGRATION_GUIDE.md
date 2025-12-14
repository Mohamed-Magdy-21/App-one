# PostgreSQL Migration Guide

## Overview

This guide will help you migrate from SQLite to Neon PostgreSQL to fix the serverless deployment error.

## Prerequisites

- Existing SQLite database with data (optional - can start fresh)
- Neon account (free tier available)
- Access to your deployment platform's environment variables

---

## Part 1: Set Up Neon PostgreSQL

### 1. Create Neon Account

1. Visit [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up using GitHub, Google, or email
3. Verify your email if prompted

### 2. Create Database Project

1. Click **"Create Project"**
2. Configure:
   - **Name**: `pos-system` (or your preference)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: Latest (default)
3. Click **"Create Project"**

### 3. Get Connection String

After creation, copy your **Connection String**:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Save this - you'll need it!**

---

## Part 2: Update Local Environment

### 1. Update `.env` File

Replace your current `DATABASE_URL` with the Neon connection string:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_ALLOWED_HOSTS="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Push Schema to PostgreSQL

```bash
npx prisma db push
```

This creates all tables in your new PostgreSQL database.

---

## Part 3: Migrate Existing Data (Optional)

If you have existing data in SQLite that you want to keep:

### Option A: Automated Migration Script

```bash
node migrate-data.js
```

This will copy all users, products, sales, and sold items from SQLite to PostgreSQL.

### Option B: Start Fresh

Skip data migration and create a new admin user:

```bash
node reset-admin.js
```

Default credentials:
- Username: `admin`
- Password: `admin123`

---

## Part 4: Test Locally

### 1. Start Development Server

```bash
npm run dev
```

### 2. Verify Everything Works

- ✅ Login with admin credentials
- ✅ View products
- ✅ Create a test sale
- ✅ View invoices

---

## Part 5: Deploy to Production

### 1. Update Production Environment Variables

In your deployment platform (Vercel, Netlify, Railway, etc.), add/update:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=your-production-secret-key-change-this
NEXTAUTH_URL=https://your-domain.com
AUTH_ALLOWED_HOSTS=https://your-domain.com
AUTH_TRUST_HOST=true
```

### 2. Deploy Application

```bash
git add .
git commit -m "Migrate to PostgreSQL for serverless deployment"
git push
```

Your deployment platform will automatically redeploy.

### 3. Initialize Production Database

After deployment, run migrations on production:

**For Vercel/Netlify:**
- The `prisma generate` runs automatically during build
- Database tables are created on first connection

**For Railway:**
```bash
# In Railway dashboard, run:
npx prisma db push
```

### 4. Create Production Admin User

Run the reset-admin script in production environment or manually create via Prisma Studio:

```bash
npx prisma studio
```

---

## Troubleshooting

### "Can't reach database server"

- ✅ Check connection string is correct
- ✅ Ensure `sslmode=require` is included
- ✅ Verify Neon project is active (not suspended)

### "Table does not exist"

```bash
npx prisma db push
```

### "Prisma Client not generated"

```bash
npx prisma generate
```

### Migration Script Fails

- Ensure SQLite database exists at `./pos.db`
- Check PostgreSQL connection string is correct
- Verify tables exist in PostgreSQL (`npx prisma db push`)

---

## Verification Checklist

- [ ] Neon project created
- [ ] Connection string obtained
- [ ] Local `.env` updated
- [ ] Prisma client generated
- [ ] Schema pushed to PostgreSQL
- [ ] Data migrated (or fresh start)
- [ ] Local testing successful
- [ ] Production environment variables updated
- [ ] Application deployed
- [ ] Production login works

---

## Next Steps

Once migration is complete:

1. **Delete old SQLite files** (optional):
   - `pos.db`
   - `prisma/dev.db`

2. **Update `.gitignore`** to remove SQLite references

3. **Monitor Neon usage** in the Neon dashboard

4. **Set up backups** (Neon provides automatic backups on paid plans)

---

## Support

- **Neon Documentation**: [https://neon.tech/docs](https://neon.tech/docs)
- **Prisma with PostgreSQL**: [https://www.prisma.io/docs/concepts/database-connectors/postgresql](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
