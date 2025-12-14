# ✅ Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. Neon Database Setup
- [ ] Created Neon account at [console.neon.tech](https://console.neon.tech/)
- [ ] Created new project in Neon
- [ ] Copied connection string (should include `?sslmode=require`)
- [ ] Saved connection string securely

### 2. Local Configuration
- [ ] Updated `.env` with Neon `DATABASE_URL`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push`
- [ ] Ran `node reset-admin.js`
- [ ] Tested login locally (`npm run dev`)
- [ ] Verified all features work locally

### 3. Code Repository
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] Repository is accessible

---

## 🚀 Deployment Checklist

### 1. Vercel Project Setup
- [ ] Logged into [vercel.com](https://vercel.com)
- [ ] Clicked "Add New..." → "Project"
- [ ] Imported GitHub repository
- [ ] Selected correct repository

### 2. Environment Variables Configuration

Add these in Vercel dashboard before deploying:

- [ ] `DATABASE_URL` = `postgresql://...?sslmode=require` (from Neon)
- [ ] `NEXTAUTH_SECRET` = Generate with: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` = `https://your-project.vercel.app`
- [ ] `AUTH_ALLOWED_HOSTS` = Same as `NEXTAUTH_URL`
- [ ] `AUTH_TRUST_HOST` = `true`

**Important**: 
- Use **pooled connection** string from Neon
- Generate a **different** `NEXTAUTH_SECRET` for production
- Update `NEXTAUTH_URL` after you know your Vercel domain

### 3. Deploy
- [ ] Clicked "Deploy" button
- [ ] Waited for build to complete
- [ ] Build succeeded (no errors)
- [ ] Deployment URL is live

---

## ✅ Post-Deployment Checklist

### 1. Database Initialization
- [ ] Tables created automatically (check on first visit)
- [ ] Ran `node reset-admin.js` to create admin user
  ```bash
  # Make sure .env points to production database
  node reset-admin.js
  ```

### 2. Verification
- [ ] Visited deployment URL
- [ ] Login page loads correctly
- [ ] Logged in with `admin` / `admin123`
- [ ] Dashboard loads
- [ ] Can view inventory page
- [ ] Can add a test product
- [ ] Can access POS page
- [ ] Can create a test sale
- [ ] Invoice generates correctly
- [ ] Can view sales history

### 3. Security
- [ ] Changed admin password from default
- [ ] Verified environment variables are secure
- [ ] Checked no sensitive data in Git history

---

## 🔧 Troubleshooting

### Build Fails
**Check**:
- [ ] `postinstall` script exists in `package.json`
- [ ] All dependencies are in `package.json`
- [ ] No syntax errors in code

**Solution**: Check Vercel build logs for specific errors

### Database Connection Errors
**Check**:
- [ ] `DATABASE_URL` is correct in Vercel
- [ ] Connection string includes `?sslmode=require`
- [ ] Neon project is active (not suspended)

**Solution**: Test connection string locally first

### Authentication Errors
**Check**:
- [ ] `NEXTAUTH_SECRET` is set
- [ ] `NEXTAUTH_URL` matches deployment URL
- [ ] `AUTH_TRUST_HOST` is `true`

**Solution**: Verify all auth environment variables

### "Table does not exist" Errors
**Check**:
- [ ] Ran `npx prisma db push` with production DATABASE_URL
- [ ] Database schema is up to date

**Solution**: 
```bash
# Set DATABASE_URL to production in .env temporarily
npx prisma db push
```

---

## 📊 Monitoring

After deployment:
- [ ] Monitor Neon dashboard for database usage
- [ ] Check Vercel analytics for traffic
- [ ] Review Vercel function logs for errors
- [ ] Set up alerts if needed

---

## 🎯 Quick Commands Reference

### Generate Secret Key
```bash
openssl rand -base64 32
```

### Setup Database
```bash
npx prisma generate
npx prisma db push
node reset-admin.js
```

### Test Locally
```bash
npm run dev
```

### Deploy
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

---

## 📚 Documentation References

- **Full Deployment Guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Quick Fix**: [QUICK_FIX.md](./QUICK_FIX.md)
- **Neon Setup**: [NEON_SETUP.md](./NEON_SETUP.md)

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Application loads at Vercel URL
- ✅ Can login with admin credentials
- ✅ Can perform all CRUD operations
- ✅ Data persists across page refreshes
- ✅ Invoices generate and print correctly
- ✅ No console errors in browser
- ✅ No errors in Vercel function logs

---

**Current Status**: Ready to deploy! Follow the checklist above.
