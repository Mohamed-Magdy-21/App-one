@echo off
echo ========================================
echo Neon PostgreSQL Setup Script
echo ========================================
echo.

REM Update .env file with Neon connection string
echo Creating .env file with Neon connection...
(
echo DATABASE_URL="postgresql://neondb_owner:npg_aRzUIwt18EGm@ep-icy-scene-a4ndx0ts-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
echo NEXTAUTH_SECRET="your-secret-key-here-change-this"
echo NEXTAUTH_URL="http://localhost:3000"
echo AUTH_ALLOWED_HOSTS="http://localhost:3000"
echo AUTH_TRUST_HOST="true"
) > .env

echo ✅ .env file created
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated
echo.

echo Step 2: Pushing schema to database...
call npx prisma db push
if errorlevel 1 (
    echo ❌ Failed to push schema
    pause
    exit /b 1
)
echo ✅ Schema pushed to database
echo.

echo Step 3: Creating admin user...
call node reset-admin.js
if errorlevel 1 (
    echo ❌ Failed to create admin user
    pause
    exit /b 1
)
echo ✅ Admin user created
echo.

echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Your database is ready!
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Visit: http://localhost:3000
echo   3. Test login
echo   4. Deploy to Vercel
echo.
pause
