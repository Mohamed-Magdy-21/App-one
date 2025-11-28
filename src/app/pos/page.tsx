"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, useData } from "@/context/DataContext";

type CartItem = {
  productId: string;
  productCode: string;
  name: string;
  price: number;
  quantity: number;
};

const TAX_RATE = 0;

export default function PosPage() {
  const { products, adjustStock, recordSale, dataReady } = useData();
  const router = useRouter();

  const [codeInput, setCodeInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.productCode.toLowerCase().includes(query)
    );
  }, [products, productSearch]);

  const addProductToCart = (product: Product, requestedQty: number) => {
    if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
      setMessage("Quantity must be a whole number greater than 0.");
      return;
    }

    const alreadyInCart =
      cart.find((item) => item.productId === product.id)?.quantity ?? 0;
    const available = product.stockQuantity - alreadyInCart;
    if (requestedQty > available) {
      setMessage(
        `Out of Stock: Only ${available} units of ${product.name} remaining.`
      );
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product.id);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + requestedQty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productCode: product.productCode,
          name: product.name,
          price: product.price,
          quantity: requestedQty,
        },
      ];
    });

    setMessage(`${product.name} added to cart.`);
  };

  if (!dataReady) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading POS...
      </div>
    );
  }

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const productCode = codeInput.trim();
    const requestedQty = Number(quantityInput);

    if (!productCode) {
      setMessage("Enter or scan a product code to proceed.");
      return;
    }
    if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
      setMessage("Quantity must be a whole number greater than 0.");
      return;
    }

    const product = products.find(
      (item) => item.productCode.toLowerCase() === productCode.toLowerCase()
    );
    if (!product) {
      setMessage("Product not found. Double-check the code.");
      return;
    }

    addProductToCart(product, requestedQty);
    setCodeInput("");
    setQuantityInput("1");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    if (quantity > product.stockQuantity) {
      setMessage(
        `Out of Stock: Cannot set ${product.name} higher than available ${product.stockQuantity}.`
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    setMessage(null);
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const completeSale = () => {
    if (cart.length === 0) {
      setMessage("Add at least one item before completing the sale.");
      return;
    }

    const insufficient = cart.find((item) => {
      const product = products.find((prod) => prod.id === item.productId);
      return !product || item.quantity > product.stockQuantity;
    });
    if (insufficient) {
      setMessage(
        `Out of Stock: ${insufficient.name} exceeds available inventory.`
      );
      return;
    }

    cart.forEach((item) => adjustStock(item.productId, -item.quantity));
    const saleId = recordSale({
      soldItems: cart.map((item) => ({
        productId: item.productId,
        productCode: item.productCode,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      totalAmount: totals.total,
    });

    setCart([]);
    setMessage("Sale completed successfully.");
    router.push(`/invoice/${saleId}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="card-surface space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Point of Sale
          </h2>
          <p className="text-sm text-slate-500">
            Scan product codes or type them in manually.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="grid gap-4 md:grid-cols-[2fr,1fr,auto]"
        >
          <input
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Product code / barcode"
          />
          <input
            type="number"
            min="1"
            step="1"
            value={quantityInput}
            onChange={(event) => setQuantityInput(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Add Item
          </button>
        </form>

        {message && (
          <p
            className={`rounded-xl px-4 py-2 text-sm ${
              message.startsWith("Out of Stock")
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </p>
        )}

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Available Products
              </p>
              <p className="text-xs text-slate-500">
                Search and tap add to queue an item instantly.
              </p>
            </div>
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search by name or code"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="text-slate-700">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                      {product.productCode}
                    </td>
                    <td className="px-3 py-2 font-medium">{product.name}</td>
                    <td className="px-3 py-2 text-center text-slate-500">
                      {product.stockQuantity}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => addProductToCart(product, 1)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        + Add
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-400"
                    >
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  Item
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  Code
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  Qty
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  Price
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  Subtotal
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item) => (
                <tr key={item.productId}>
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {item.productCode}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.productId,
                          Number(event.target.value)
                        )
                      }
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-800">
              ${(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    No items in cart. Scan a product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
          <p className="text-sm text-slate-500">
            Review subtotal, tax, and grand total before collecting payment.
          </p>
        </div>
        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="text-slate-900 font-semibold">
              ${totals.subtotal.toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">
              Tax ({(TAX_RATE * 100).toFixed(0)}%)
            </dt>
            <dd className="text-slate-900 font-semibold">
              ${totals.tax.toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base">
            <dt className="font-semibold text-slate-900">Grand Total</dt>
            <dd className="font-bold text-emerald-600">
              ${totals.total.toFixed(2)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={completeSale}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={cart.length === 0}
        >
          Complete Sale &amp; Print Invoice
        </button>
        <p className="text-xs text-slate-400">
          Stock levels update automatically when the sale completes.
        </p>
      </section>
    </div>
  );
}

