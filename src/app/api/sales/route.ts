import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({ include: { soldItems: true }, orderBy: { date: 'desc' } });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Fetch sales error', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { soldItems, subtotal, tax, totalAmount } = body;

    const sale = await prisma.sale.create({
      data: {
        subtotal: Number(subtotal),
        tax: Number(tax),
        totalAmount: Number(totalAmount),
        soldItems: {
          create: soldItems.map((s: any) => ({
            productId: s.productId,
            productCode: s.productCode,
            name: s.name,
            quantity: Number(s.quantity),
            price: Number(s.price),
          })),
        },
      },
      include: { soldItems: true },
    });

    // Adjust stock quantities for each product
    for (const item of soldItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: Number(item.quantity) } as any },
      });
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Record sale error', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}
