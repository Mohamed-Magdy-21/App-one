import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productCode, name, price, stockQuantity, imageUrl } = body;
    const product = await prisma.product.create({ data: { productCode, name, price: Number(price), stockQuantity: Number(stockQuantity), imageUrl } });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
