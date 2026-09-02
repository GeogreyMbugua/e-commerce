"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchCategories, fetchProducts } from "@/lib/catalog";
import { toViewProducts } from "@/lib/catalog-adapter";
import type { CatalogCategory, CatalogSort } from "@/types/catalog";
import type { Product } from "@/types/product";

export type ShopFilters = {
  search?: string;
  category?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort: CatalogSort;
};

const parseNumber = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseFilters = (searchParams: URLSearchParams): ShopFilters => {
  const sort = searchParams.get("sort");

  return {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    minPriceMinor: parseNumber(searchParams.get("minPriceMinor")),
    maxPriceMinor: parseNumber(searchParams.get("maxPriceMinor")),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "newest"
        ? sort
        : "newest",
  };
};

const filtersToSearchParams = (filters: ShopFilters) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.minPriceMinor !== undefined) {
    params.set("minPriceMinor", String(filters.minPriceMinor));
  }

  if (filters.maxPriceMinor !== undefined) {
    params.set("maxPriceMinor", String(filters.maxPriceMinor));
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  return params;
};

export function useShopCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFilters = useCallback(
    (patch: Partial<ShopFilters>) => {
      const nextFilters = { ...filters, ...patch };
      const params = filtersToSearchParams(nextFilters);
      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((result) => {
        if (!cancelled) {
          setCategories(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchProducts(filters)
      .then((response) => {
        if (!cancelled) {
          setProducts(toViewProducts(response.data));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setError(
            "We couldn't load the catalog right now. Check that the API is running and try again.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return {
    products,
    categories,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
  };
}
