import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.productCode !== undefined) updates.productCode = body.productCode;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.stockQuantity !== undefined) updates.stockQuantity = Number(body.stockQuantity);
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    const product = await prisma.product.update({ where: { id }, data: updates });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete product error', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
