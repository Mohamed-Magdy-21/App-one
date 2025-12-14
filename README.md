# Ziad POS System

A comprehensive Point of Sale (POS) system for retail operations with inventory management, sales processing, and invoice generation.

## Features

- **Inventory Management**: Add, edit, and manage products with real-time stock tracking
- **Point of Sale**: Quick product scanning, cart management, and transaction processing
- **Invoice Generation**: Professional, printable invoices with company branding
- **Stock Adjustments**: Add or deduct inventory quantities as needed
- **Sales History**: Track all completed transactions with detailed records

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Setup Database

After installing dependencies and configuring your `.env` file with `DATABASE_URL`:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create admin user
node reset-admin.js
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/inventory` - Product management and stock adjustment interface
- `/pos` - Point of Sale transaction screen
- `/invoice/[id]` - Individual invoice/receipt view

## Database

The application uses **Neon PostgreSQL** for data persistence, making it compatible with serverless deployments.

### First-Time Setup

1. Create a Neon account at [console.neon.tech](https://console.neon.tech/)
2. Create a new project and copy the connection string
3. Update `.env` with your `DATABASE_URL`
4. Run database setup:

```bash
npx prisma generate
npx prisma db push
node reset-admin.js
```

**See [QUICK_FIX.md](./QUICK_FIX.md) for detailed setup instructions.**

## Build for Production

### Web Application

```bash
npm run build
npm start
```

### Desktop Application (Electron)

The application can be packaged as a standalone desktop application for Windows, macOS, and Linux.

#### Development Mode (with Electron)

Run the Next.js dev server and Electron together:

```bash
npm run electron:dev
```

#### Build Desktop Application

**For Windows (.exe):**
```bash
npm run electron:build:win
```

**For macOS (.dmg):**
```bash
npm run electron:build:mac
```

**For Linux (AppImage):**
```bash
npm run electron:build:linux
```

**For all platforms:**
```bash
npm run electron:build
```

The built executable will be in the `dist` folder. You can double-click it to launch the Ziad POS System as a standalone desktop application.

#### First Time Setup

After installing dependencies, run:

```bash
npm run postinstall
```

This installs Electron's native dependencies.

## Technologies

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Electron (for desktop app)
