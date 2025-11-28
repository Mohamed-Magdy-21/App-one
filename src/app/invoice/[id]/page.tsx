"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useMemo } from "react";
import { useData } from "@/context/DataContext";

type InvoicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function InvoicePage({ params }: InvoicePageProps) {
  const resolvedParams = use(params);
  const { sales, dataReady } = useData();
  const sale = useMemo(
    () => sales.find((entry) => entry.id === resolvedParams.id),
    [sales, resolvedParams.id]
  );

  if (!dataReady) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading invoice...
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="card-surface text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Invoice not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The sale you are looking for could not be located.
        </p>
        <Link
          href="/pos"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Return to POS
        </Link>
      </div>
    );
  }

  const readableDate = new Date(sale.date).toLocaleString();
  const invoiceNumber = sale.id.slice(-6).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Thermal Receipt - Print Optimized */}
      <div className="thermal-receipt card-surface print:border-none print:bg-transparent print:shadow-none">
        {/* Header - Company Info with Logo */}
        <header className="thermal-header flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between print:block print:border-0 print:pb-2">
          {/* Logo - Visible in both screen and print */}
          <div className="flex items-center gap-4 print:block print:gap-0 print:text-center">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg border border-slate-200 object-cover print:h-auto print:w-full print:max-w-[60mm] print:mx-auto print:mb-2 print:border-0 print:block"
            />
            <div className="print:text-center print:mt-2">
              <p className="text-xl font-bold text-slate-900 print:text-xs print:font-bold print:mb-1">
                Ziad POS System
              </p>
              <p className="text-sm text-slate-500 print:text-[8px] print:mb-0.5">
                123 Market Street · Retail City, RC 10001
              </p>
              <p className="text-xs text-slate-400 print:text-[8px]">
                support@ziadpos.local · +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="thermal-invoice-info text-sm text-slate-600 print:text-center print:text-[9px] print:border-t print:border-b print:border-dashed print:border-black print:py-1 print:my-2">
            <p className="font-semibold text-slate-800 print:font-bold print:text-[9px] print:mb-0.5">
              Invoice #{invoiceNumber}
            </p>
            <p className="print:text-[9px]">{readableDate}</p>
          </div>
        </header>

        {/* Items Table - Simplified for Thermal */}
        <section className="mt-6 print:mt-2">
          <table className="thermal-table min-w-full divide-y divide-slate-200 text-sm print:text-[9px]">
            <thead className="bg-slate-50 print:bg-transparent">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 print:px-0 print:py-1 print:text-[8px] print:font-bold print:border-b print:border-black">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 print:px-0 print:py-1 print:text-[8px] print:font-bold print:border-b print:border-black">
                  Item
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 print:px-0 print:py-1 print:text-[8px] print:font-bold print:border-b print:border-black">
                  Qty
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 print:px-0 print:py-1 print:text-[8px] print:font-bold print:border-b print:border-black">
                  Price
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600 print:px-0 print:py-1 print:text-[8px] print:font-bold print:border-b print:border-black">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-y-0">
              {sale.soldItems.map((item) => (
                <tr key={item.productId} className="print:border-b print:border-dotted print:border-gray-600">
                  <td className="thermal-product-code px-3 py-3 text-slate-500 print:px-0 print:py-1 print:text-[8px] print:font-bold print:font-mono">
                    {item.productCode}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800 print:px-0 print:py-1 print:text-[9px] print:font-normal">
                    {item.name}
                  </td>
                  <td className="px-3 py-3 text-slate-500 print:px-0 print:py-1 print:text-[9px]">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-3 text-slate-500 print:px-0 print:py-1 print:text-[9px]">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800 print:px-0 print:py-1 print:text-[9px] print:font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals Section - Thermal Optimized */}
        <section className="thermal-totals mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-start sm:justify-between print:mt-2 print:border-t-2 print:border-black print:pt-2 print:pb-1">
          <div className="print:hidden">
            <p className="text-sm font-semibold text-slate-700">Notes</p>
            <p className="text-sm text-slate-500">
              Keep this receipt for your records. Reach out within 7 days for
              questions or adjustments.
            </p>
          </div>
          <dl className="thermal-totals min-w-[220px] space-y-2 text-sm print:min-w-0 print:w-full print:space-y-0">
            <div className="thermal-totals-row flex items-center justify-between print:justify-between print:text-[9px] print:my-0.5">
              <dt className="text-slate-500 print:text-[9px]">Subtotal</dt>
              <dd className="font-semibold text-slate-900 print:text-[9px] print:font-bold">
                ${sale.subtotal.toFixed(2)}
              </dd>
            </div>
            <div className="thermal-totals-row flex items-center justify-between print:justify-between print:text-[9px] print:my-0.5">
              <dt className="text-slate-500 print:text-[9px]">Tax</dt>
              <dd className="font-semibold text-slate-900 print:text-[9px] print:font-bold">
                ${sale.tax.toFixed(2)}
              </dd>
            </div>
            <div className="thermal-grand-total flex items-center justify-between border-t border-slate-200 pt-2 text-base print:border-t-2 print:border-b-2 print:border-black print:pt-2 print:pb-2 print:my-2 print:text-[11px]">
              <dt className="font-semibold text-slate-900 print:font-bold print:text-[11px]">
                Grand Total
              </dt>
              <dd className="font-bold text-emerald-600 print:text-[11px] print:font-bold print:text-black">
                ${sale.totalAmount.toFixed(2)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Footer - Copyright */}
        <footer className="thermal-footer mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500 print:mt-2 print:pt-2 print:border-t print:border-dashed print:border-black print:text-[8px]">
          <p className="print:mb-1">Thank you for your purchase!</p>
          <p className="print:font-bold print:mt-1">
            © 2025 Copyright Mohamed Magdy
          </p>
        </footer>
      </div>

      {/* Screen-only buttons */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Print Receipt
        </button>
        <Link
          href="/pos"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to POS
        </Link>
      </div>
    </div>
  );
}

