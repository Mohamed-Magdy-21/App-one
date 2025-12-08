# Production Deployment Guide

This guide covers deploying the POS application to production at **https://pos.livora-home.com/**.

## Prerequisites

- Hostinger hosting account with Node.js support
- Production database configured
- Admin user credentials set up in the database

## Environment Variables Configuration

### Required Environment Variables

The following environment variables **must** be configured in your Hostinger control panel:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://pos.livora-home.com` | Production domain URL (CRITICAL) |
| `NEXTAUTH_SECRET` | `<your-secret>` | Secret key for NextAuth session encryption |
| `DATABASE_URL` | `<your-db-url>` | Production database connection string |

### Setting Environment Variables in Hostinger

1. Log in to your Hostinger control panel
2. Navigate to your website → **Advanced** → **Environment Variables**
3. Add each variable:
   - Click **Add New Variable**
   - Enter the variable name (e.g., `NEXTAUTH_URL`)
   - Enter the value (e.g., `https://pos.livora-home.com`)
   - Click **Save**
4. Repeat for all required variables

> **Important**: Do NOT include a trailing slash in `NEXTAUTH_URL`

### Generating NEXTAUTH_SECRET

If you need to generate a new secret for production:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Build and Deployment

### 1. Local Build Test

Before deploying, verify the production build works locally:

```powershell
# Set production environment variable temporarily
$env:NEXTAUTH_URL="https://pos.livora-home.com"

# Run production build
npm run build

# Expected output: Build completed successfully with no errors
```

### 2. Deploy to Hostinger

#### Option A: Git Deployment (Recommended)

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Production configuration for pos.livora-home.com"
   git push origin main
   ```

2. In Hostinger control panel:
   - Navigate to **Git** → **Deploy**
   - Select your repository and branch
   - Click **Deploy**

#### Option B: Manual Upload

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Upload the following to Hostinger via FTP/File Manager:
   - `.next/` directory
   - `public/` directory
   - `node_modules/` directory (or run `npm install` on server)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `prisma/` directory
   - Database file (if using SQLite)

### 3. Database Setup

If using a fresh production database:

```bash
# SSH into your Hostinger server
ssh user@your-server

# Navigate to application directory
cd /path/to/your/app

# Run database migrations
npx prisma migrate deploy

# Seed admin user (if needed)
node reset-admin.js
```

## Post-Deployment Verification

### 1. Authentication Test

- [ ] Visit `https://pos.livora-home.com/login`
- [ ] Log in with admin credentials
- [ ] Verify successful authentication
- [ ] Confirm redirect to `/inventory` page

### 2. URL Verification

- [ ] Open browser Developer Tools → Network tab
- [ ] Navigate through the application
- [ ] Verify all API requests use `https://pos.livora-home.com`
- [ ] Check for no mixed content warnings (HTTP/HTTPS)

### 3. Functionality Test

- [ ] **Inventory Management**: Add, edit, delete products
- [ ] **POS System**: Create sales, process transactions
- [ ] **Invoice Generation**: View and print invoices
- [ ] **User Roles**: Test both Admin and Cashier access levels

### 4. Session Persistence

- [ ] Log in and navigate between pages
- [ ] Verify session remains active
- [ ] Close browser and reopen
- [ ] Confirm session persists (if "Remember me" enabled)
- [ ] Test logout functionality

## Troubleshooting

### Issue: "Invalid CSRF Token" or Authentication Errors

**Solution**: Verify `NEXTAUTH_URL` is set correctly:
- Must be `https://pos.livora-home.com` (no trailing slash)
- Must match the exact domain users access
- Must use HTTPS in production

### Issue: Database Connection Errors

**Solution**: Check `DATABASE_URL`:
- Verify database file exists (SQLite)
- Confirm connection credentials (PostgreSQL/MySQL)
- Ensure database migrations are applied

### Issue: 404 Errors on Page Refresh

**Solution**: Configure Hostinger rewrites:
- Add rewrite rule to redirect all requests to `index.html`
- Or ensure Node.js server is running (not static hosting)

### Issue: Environment Variables Not Loading

**Solution**:
- Restart the application after setting environment variables
- Verify variables are set in the correct environment (production)
- Check variable names match exactly (case-sensitive)

## Rollback Procedure

If issues occur after deployment:

1. **Revert Git Deployment**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Previous Build**:
   - Keep backup of previous `.next/` directory
   - Replace current build with backup

3. **Database Rollback**:
   ```bash
   # Restore database backup
   cp pos.db.backup pos.db
   ```

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is unique and secure (32+ characters)
- [ ] Database credentials are not exposed in code
- [ ] `.env.local` and `.env.production` are in `.gitignore`
- [ ] HTTPS is enforced (no HTTP access)
- [ ] Admin password is strong and changed from default

## Support

For issues or questions:
- Review application logs in Hostinger control panel
- Check browser console for client-side errors
- Verify all environment variables are set correctly
- Ensure database is accessible and migrations are applied
