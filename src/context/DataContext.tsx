"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Product = {
  id: string;
  productCode: string;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string; // Base64 encoded image data URI
};

export type SoldItem = {
  productId: string;
  productCode: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string; // Base64 encoded image data URI
};

export type Sale = {
  id: string;
  date: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  soldItems: SoldItem[];
};

type RecordSalePayload = {
  soldItems: SoldItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
};

type DataContextValue = {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, "id">) => string;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  recordSale: (payload: RecordSalePayload) => string;
  dataReady: boolean;
};

const defaultProducts: Product[] = [
  {
    id: "sample-espresso",
    productCode: "ESP-1001",
    name: "Espresso Shot",
    price: 3.0,
    stockQuantity: 30,
  },
  {
    id: "sample-cappuccino",
    productCode: "CAP-2002",
    name: "Cappuccino",
    price: 4.5,
    stockQuantity: 24,
  },
  {
    id: "sample-bagel",
    productCode: "BG-3003",
    name: "Fresh Bagel",
    price: 2.25,
    stockQuantity: 50,
  },
];

const DataContext = createContext<DataContextValue | undefined>(undefined);

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ready, setReady] = useState(false);

  // On mount, fetch initial data from API server.
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/sales'),
        ]);

        const [pJson, sJson] = await Promise.all([pRes.ok ? pRes.json() : null, sRes.ok ? sRes.json() : null]);

        startTransition(() => {
          if (!mounted) return;
          setProducts(pJson && Array.isArray(pJson) && pJson.length ? pJson : defaultProducts);
          setSales(sJson && Array.isArray(sJson) ? sJson : []);
          setReady(true);
        });
      } catch (error) {
        console.error('Failed to fetch initial data', error);
        startTransition(() => {
          if (!mounted) return;
          setProducts(defaultProducts);
          setSales([]);
          setReady(true);
        });
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const addProduct = useCallback(
    (product: Omit<Product, "id">) => {
      // Optimistic add: generate temporary id, then POST to API
      const tempId = generateId();
      const temp = { ...product, id: tempId };
      setProducts((prev) => [...prev, temp]);

      (async () => {
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          if (!res.ok) throw new Error('Failed to create product');
          const created = await res.json();
          // Replace temp item id with real id from server
          setProducts((prev) => prev.map((p) => (p.id === tempId ? created : p)));
        } catch (error) {
          console.error('Add product failed', error);
          // remove temp
          setProducts((prev) => prev.filter((p) => p.id !== tempId));
        }
      })();

      return tempId;
    },
    []
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Omit<Product, "id">>) => {
      // Optimistic update locally, then send to API
      setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updates } : product)));
      (async () => {
        try {
          await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Update product failed', error);
        }
      })();
    },
    []
  );

  const adjustStock = useCallback((id: string, delta: number) => {
    // Optimistic stock adjust locally, persist via PUT
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, stockQuantity: Math.max(product.stockQuantity + delta, 0) } : product)));
    (async () => {
      try {
        const prod = products.find((p) => p.id === id);
        if (!prod) return;
        const newQty = Math.max(prod.stockQuantity + delta, 0);
        await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockQuantity: newQty }),
        });
      } catch (error) {
        console.error('Adjust stock failed', error);
      }
    })();
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    (async () => {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Delete product failed', error);
      }
    })();
  }, []);

  const recordSale = useCallback((sale: RecordSalePayload) => {
    // Optimistic sale: create temporary id and push to state, then POST to API
    const tempId = generateId();
    const payload: Sale = {
      ...sale,
      id: tempId,
      date: new Date().toISOString(),
    };

    setSales((prev) => [payload, ...prev]);

    (async () => {
      try {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale),
        });
        if (!res.ok) throw new Error('Failed to record sale');
        const created = await res.json();
        // replace temp sale with created
        setSales((prev) => prev.map((s) => (s.id === tempId ? created : s)));
        // Refresh products list to ensure stock quantities are fresh
        const pRes = await fetch('/api/products');
        if (pRes.ok) {
          const pJson = await pRes.json();
          setProducts(pJson);
        }
      } catch (error) {
        console.error('Record sale failed', error);
        // Optionally remove temp sale on failure
      }
    })();

    return tempId;
  }, [products, ready]);

  const value = useMemo<DataContextValue>(
    () => ({
      products,
      sales,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      dataReady: ready,
    }),
    [
      products,
      sales,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      ready,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}

