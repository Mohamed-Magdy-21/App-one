# Deployment Guide

This project is built with **Next.js** and uses **Neon PostgreSQL** for the database.

## 1. Prerequisites

### Database Setup

The project is configured to use **Neon PostgreSQL** (serverless-compatible).

If you haven't set up your database yet, follow the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete instructions.

**Quick Setup:**
1. Create account at [Neon](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string
4. Update environment variables (see below)

## 2. GitHub Setup

1.  Initialize Git (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a Repository on [GitHub](https://github.com/new).
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## 3. Deployment (Vercel)

1.  Go to [Vercel](https://vercel.com) and "Add New Project".
2.  Import your GitHub repository.
3.  **Environment Variables**: Add the following in the Vercel dashboard:
    - `DATABASE_URL`: Your Neon PostgreSQL connection string (e.g., `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
    - `NEXTAUTH_SECRET`: Generate one using `openssl rand -base64 32`
    - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
    - `AUTH_ALLOWED_HOSTS`: Same as `NEXTAUTH_URL`
    - `AUTH_TRUST_HOST`: `true`
4.  **Deploy**: Click Deploy.
5.  **Post-Deploy**: 
    - The `postinstall` script in `package.json` will automatically run `prisma generate`.
    - Database tables are created automatically on first connection.
    - Create admin user using Prisma Studio or the reset-admin script.

## 4. Deployment (Netlify)

1.  Go to [Netlify](https://netlify.com) and "Import from Git".
2.  Select your repository.
3.  **Build Settings**:
    - Build command: `npm run build`
    - Publish directory: `.next`
4.  **Environment Variables**:
    - Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in Site Settings > Build & deploy > Environment.
5.  **Deploy**.
