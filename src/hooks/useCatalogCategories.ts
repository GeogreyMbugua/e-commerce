"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/catalog";
import type { CatalogCategory } from "@/types/catalog";

type UseCatalogCategoriesResult = {
  categories: CatalogCategory[];
  loading: boolean;
  error: string | null;
};

export const useCatalogCategories = (): UseCatalogCategoriesResult => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchCategories();
        if (!cancelled) {
          setCategories(result);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load categories.");
          setCategories([]);
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
  }, []);

  return { categories, loading, error };
};
