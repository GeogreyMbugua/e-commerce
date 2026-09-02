"use client";

import { useEffect, useState } from "react";
import { toViewProducts } from "@/lib/catalog-adapter";
import { fetchProducts } from "@/lib/catalog";
import type { CatalogListParams } from "@/types/catalog";
import type { Product } from "@/types/product";

type UseCatalogProductsResult = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

export const useCatalogProducts = (
  params: CatalogListParams = {},
): UseCatalogProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = params.search ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "newest";
  const limit = params.limit ?? 20;
  const minPriceMinor = params.minPriceMinor;
  const maxPriceMinor = params.maxPriceMinor;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchProducts({
          search: search || undefined,
          category: category || undefined,
          sort,
          limit,
          minPriceMinor,
          maxPriceMinor,
        });

        if (!cancelled) {
          setProducts(toViewProducts(response.data));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load products.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [search, category, sort, limit, minPriceMinor, maxPriceMinor]);

  return { products, loading, error };
};
