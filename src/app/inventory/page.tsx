"use client";

import { FormEvent, useMemo, useState } from "react";
import { Product, useData } from "@/context/DataContext";

type ProductForm = {
  productCode: string;
  name: string;
  price: string;
  stockQuantity: string;
};

const emptyForm: ProductForm = {
  productCode: "",
  name: "",
  price: "",
  stockQuantity: "",
};

export default function InventoryPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    dataReady,
  } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [stockProductId, setStockProductId] = useState<string>("");
  const [stockMode, setStockMode] = useState<"add" | "deduct">("add");
  const [stockAmount, setStockAmount] = useState<string>("1");

  const totalInventoryValue = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * product.stockQuantity,
        0
      ),
    [products]
  );

  if (!dataReady) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading inventory...
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(form.price);
    const parsedQuantity = Number(form.stockQuantity);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFeedback("Price must be a positive number.");
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setFeedback("Stock must be a whole number greater than or equal to 0.");
      return;
    }

    const duplicateCode = products.some(
      (product) =>
        product.productCode.trim().toLowerCase() ===
          form.productCode.trim().toLowerCase() &&
        product.id !== editingId
    );
    if (duplicateCode) {
      setFeedback("That product code already exists. Please choose another.");
      return;
    }

    const payload = {
      productCode: form.productCode.trim(),
      name: form.name.trim(),
      price: parsedPrice,
      stockQuantity: parsedQuantity,
    };

    if (editingId) {
      updateProduct(editingId, payload);
      setFeedback("Product updated successfully.");
    } else {
      addProduct(payload);
      setFeedback("Product added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      productCode: product.productCode,
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
    });
    setFeedback(`Editing ${product.name}`);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFeedback(null);
  };

  const handleStockSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stockProductId) {
      setFeedback("Please select a product to adjust stock.");
      return;
    }
    const amount = Number(stockAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setFeedback("Adjustment amount must be a whole number greater than 0.");
      return;
    }

    const delta = stockMode === "add" ? amount : -amount;
    adjustStock(stockProductId, delta);
    const productName =
      products.find((product) => product.id === stockProductId)?.name ?? "";
    setFeedback(
      `${stockMode === "add" ? "Added" : "Deducted"} ${amount} units for ${productName}.`
    );
    setStockAmount("1");
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Delete ${name}? This action cannot be undone.`
    );
    if (!confirmed) return;
    deleteProduct(id);
    if (editingId === id) {
      resetForm();
    }
    setFeedback(`${name} deleted.`);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-surface">
          <p className="text-sm text-slate-500">Total SKUs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {products.length}
          </p>
          <p className="text-xs text-slate-500">Unique products in inventory.</p>
        </article>
        <article className="card-surface">
          <p className="text-sm text-slate-500">Items on Hand</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {products.reduce((sum, product) => sum + product.stockQuantity, 0)}
          </p>
          <p className="text-xs text-slate-500">Individual units in stock.</p>
        </article>
        <article className="card-surface">
          <p className="text-sm text-slate-500">Inventory Value</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            ${totalInventoryValue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">Retail value at list price.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card-surface">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-sm text-slate-500">
                Maintain product details and pricing.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Product Code / SKU
              </label>
              <input
                value={form.productCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    productCode: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. ESP-1001"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Product Name
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. Cappuccino"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stockQuantity: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {editingId ? "Save Changes" : "Add Product"}
            </button>
          </form>
        </article>

        <article className="card-surface">
          <h2 className="text-lg font-semibold text-slate-900">
            Adjust Stock
          </h2>
          <p className="text-sm text-slate-500">
            Quickly add intake shipments or deduct spoilage.
          </p>

          <form onSubmit={handleStockSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Select Product
              </label>
              <select
                value={stockProductId}
                onChange={(event) => setStockProductId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Choose a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stockQuantity} on hand)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockMode("add")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    stockMode === "add"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setStockMode("deduct")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    stockMode === "deduct"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Deduct
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={stockAmount}
                onChange={(event) => setStockAmount(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Apply Adjustment
            </button>
          </form>
        </article>
      </section>

      <section className="card-surface">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product Catalog
            </h2>
            <p className="text-sm text-slate-500">
              Searchable overview of all stocked items.
            </p>
          </div>
          {feedback && (
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {feedback}
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-500">
                  Product
                </th>
                <th className="px-3 py-2 font-semibold text-slate-500">
                  SKU
                </th>
                <th className="px-3 py-2 font-semibold text-slate-500">
                  Price
                </th>
                <th className="px-3 py-2 font-semibold text-slate-500">
                  Stock
                </th>
                <th className="px-3 py-2 font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {product.productCode}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {product.stockQuantity}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                    No products yet. Add your first item above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

