# Neon PostgreSQL Setup Guide

## Step 1: Create Neon Account

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up with GitHub, Google, or email
3. Verify your email if required

## Step 2: Create a New Project

1. Click **"Create Project"** or **"New Project"**
2. Configure your project:
   - **Project Name**: `pos-system` (or your preferred name)
   - **Region**: Choose the closest region to your users
   - **PostgreSQL Version**: Use default (latest stable)
3. Click **"Create Project"**

## Step 3: Get Connection String

1. After project creation, you'll see the **Connection Details**
2. Copy the **Connection String** (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Important**: Save this connection string - you'll need it for environment variables

### Connection String Format
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
```

## Step 4: Configure Environment Variables

### For Local Development
Update your `.env` file:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
AUTH_ALLOWED_HOSTS="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

### For Production Deployment
Add the following environment variables to your deployment platform (Vercel, Netlify, Railway, etc.):

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-production-domain.com
AUTH_ALLOWED_HOSTS=https://your-production-domain.com
AUTH_TRUST_HOST=true
```

## Step 5: Run Migrations

After updating your environment variables, run:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create and run migrations
npx prisma migrate dev --name init
```

## Step 6: Seed Initial Data

Create an admin user:

```bash
node reset-admin.js
```

## Troubleshooting

### Connection Issues
- Ensure `sslmode=require` is in your connection string
- Check that your IP is not blocked (Neon allows all IPs by default)
- Verify the connection string is correct

### Migration Errors
- Delete `prisma/migrations` folder if switching from SQLite
- Use `npx prisma db push` for initial setup
- Use `npx prisma migrate dev` for subsequent changes

### Prisma Client Errors
- Run `npx prisma generate` after schema changes
- Restart your development server

## Next Steps

Once you've completed the setup:
1. Test local development with `npm run dev`
2. Verify database connection
3. Deploy to production with updated environment variables
