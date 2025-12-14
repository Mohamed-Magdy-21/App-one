# 🚀 Vercel Deployment - Step by Step

## Part 1: Create Neon Database (5 minutes)

### Step 1: Sign Up/Login to Neon

You should see the Neon login page. Choose one of:
- **GitHub** (recommended - easiest)
- **Google**
- **Email**

Click your preferred login method and complete authentication.

### Step 2: Create New Project

After logging in:

1. Click **"Create a project"** or **"New Project"** button
2. Fill in the details:
   - **Project Name**: `pos-ziad` (or your preference)
   - **Region**: Choose closest to your users (e.g., `AWS US East (N. Virginia)` for US)
   - **PostgreSQL Version**: Keep default (latest)
3. Click **"Create Project"**

### Step 3: Copy Connection String

After project creation, you'll see **Connection Details**:

1. Look for **Connection string** section
2. Select **"Pooled connection"** (recommended for serverless)
3. Click the **Copy** button next to the connection string

It will look like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**IMPORTANT**: Save this somewhere - you'll need it in the next steps!

---

## Part 2: Configure Local Environment (2 minutes)

### Step 1: Update .env File

Open your `.env` file and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_ALLOWED_HOSTS="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

Replace the connection string with the one you copied from Neon.

### Step 2: Setup Database

Open your terminal and run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Create tables in PostgreSQL
npx prisma db push

# Create admin user
node reset-admin.js
```

You should see:
```
✅ Admin user created successfully!
Username: admin
Password: admin123
```

### Step 3: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and login with:
- Username: `admin`
- Password: `admin123`

**✅ If login works, your database is configured correctly!**

---

## Part 3: Deploy to Vercel (5 minutes)

### Step 1: Push Code to GitHub (if not already done)

```bash
git add .
git commit -m "Migrate to PostgreSQL for Vercel deployment"
git push
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your POS repository

### Step 3: Configure Environment Variables

Before deploying, click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string (the same one from .env) |
| `NEXTAUTH_SECRET` | Generate new: Run `openssl rand -base64 32` in terminal |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` (Vercel will show this) |
| `AUTH_ALLOWED_HOSTS` | Same as `NEXTAUTH_URL` |
| `AUTH_TRUST_HOST` | `true` |

**Important Notes:**
- For `NEXTAUTH_URL`, use the Vercel domain shown in the deployment settings
- Generate a **NEW** `NEXTAUTH_SECRET` for production (don't use the same as local)
- Make sure `DATABASE_URL` includes `?sslmode=require` at the end

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Vercel will automatically:
   - Install dependencies
   - Run `prisma generate` (via postinstall script)
   - Build your Next.js app
   - Deploy to production

### Step 5: Initialize Production Database

After deployment completes:

1. Click on your deployed project
2. Go to **"Settings"** → **"Functions"**
3. Or simply visit your deployed URL and try to login

The database tables will be created automatically on first connection.

---

## Part 4: Create Production Admin User

### Option A: Using Vercel CLI (Recommended)

Install Vercel CLI if you don't have it:
```bash
npm i -g vercel
```

Login and run the script:
```bash
vercel login
vercel env pull .env.production
node reset-admin.js
```

### Option B: Using Prisma Studio

```bash
npx prisma studio
```

This opens a web interface where you can manually create a user:
- **username**: `admin`
- **password**: Hash of `admin123` (use bcrypt)
- **role**: `ADMIN`

### Option C: Run Script Locally (Easiest)

Since your local `.env` already points to the production database, just run:

```bash
node reset-admin.js
```

This creates the admin user directly in your production database.

---

## Part 5: Verify Deployment ✅

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Test key features:
   - ✅ View inventory
   - ✅ Add a product
   - ✅ Create a sale
   - ✅ View invoice

---

## Troubleshooting

### "Invalid credentials" on login

**Solution**: Make sure you ran `node reset-admin.js` after setting up the database.

### "Can't reach database server"

**Solution**: 
- Verify `DATABASE_URL` in Vercel environment variables
- Ensure connection string includes `?sslmode=require`
- Check Neon project is active (not suspended)

### Build fails with Prisma errors

**Solution**:
- Ensure `postinstall` script exists in `package.json`:
  ```json
  "postinstall": "prisma generate"
  ```
- Redeploy after confirming

### "Table does not exist" errors

**Solution**: Tables are created automatically. If you see this error:
1. Go to Vercel deployment logs
2. Check for Prisma errors
3. May need to manually run `npx prisma db push` with production DATABASE_URL

---

## Environment Variables Summary

### Local (.env)
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
NEXTAUTH_SECRET="local-secret-key"
NEXTAUTH_URL="http://localhost:3000"
AUTH_ALLOWED_HOSTS="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

### Production (Vercel)
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=production-secret-key-different-from-local
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_ALLOWED_HOSTS=https://your-project.vercel.app
AUTH_TRUST_HOST=true
```

---

## Next Steps After Deployment

1. **Change admin password** in production
2. **Add your products** to inventory
3. **Test thoroughly** before using in production
4. **Monitor** Neon database usage in dashboard
5. **Set up custom domain** (optional) in Vercel settings

---

## 🎉 You're Done!

Your POS system is now deployed on Vercel with a production PostgreSQL database!

**Deployment URL**: Check Vercel dashboard for your live URL
**Database**: Managed by Neon (check console.neon.tech for monitoring)
