"use client";

import { useCallback, useEffect, useState } from "react";

export type ProductCategory = "spożywcze" | "chemia" | "inne";

export interface ShoppingProduct {
  id: string;
  name: string;
  category: ProductCategory;
  completed: boolean;
  createdAt: number;
}

export function useShoppingList() {
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/buylist", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się pobrać listy.");
      }

      setProducts(data.products as ShoppingProduct[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const addProduct = async (
    name: string,
    category: ProductCategory = "inne",
  ) => {
    const response = await fetch("/api/buylist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nie udało się dodać produktu.");
    }

    // Dodaj produkt do stanu bez ponownego pobierania całej listy.
    if (data.product) {
      setProducts((current) => [...current, data.product as ShoppingProduct]);
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    const response = await fetch("/api/buylist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        completed: !currentStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nie udało się zmienić statusu.");
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, completed: !currentStatus } : product,
      ),
    );
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/buylist?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nie udało się usunąć produktu.");
    }

    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const clearList = async () => {
    const response = await fetch("/api/buylist?clear=true", {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nie udało się wyczyścić listy.");
    }

    setProducts([]);
  };

  return {
    products,
    loading,
    error,
    addProduct,
    toggleProductStatus,
    deleteProduct,
    clearList,
    refresh: loadProducts,
  };
}
