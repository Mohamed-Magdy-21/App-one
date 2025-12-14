# 🚀 Quick Start: Fix Serverless Deployment Error

## The Problem
❌ **Error**: "Unable to open the database file"  
❌ **Cause**: SQLite doesn't work in serverless environments

## The Solution
✅ **Switch to Neon PostgreSQL** (5 minutes)

---

## Step-by-Step Fix

### 1️⃣ Create Neon Database (2 min)
1. Go to [console.neon.tech](https://console.neon.tech/)
2. Sign up (free)
3. Click "Create Project"
4. Copy your connection string:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
   ```

### 2️⃣ Update Local Environment (1 min)
Edit `.env` file:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"
```

### 3️⃣ Setup Database (1 min)
```bash
npx prisma generate
npx prisma db push
node reset-admin.js
```

### 4️⃣ Test Locally (1 min)
```bash
npm run dev
```
Login with: `admin` / `admin123`

### 5️⃣ Deploy to Production
**Add environment variables** in your deployment platform:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
AUTH_ALLOWED_HOSTS=https://your-domain.com
AUTH_TRUST_HOST=true
```

**Deploy:**
```bash
git add .
git commit -m "Switch to PostgreSQL"
git push
```

---

## ✅ Done!
Your app will now work in serverless environments.

---

## Need Help?
- 📖 Full guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- 🔧 Neon setup: [NEON_SETUP.md](./NEON_SETUP.md)
- 🚀 Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Migrate Existing Data?
If you have data in SQLite:
```bash
node migrate-data.js
```
