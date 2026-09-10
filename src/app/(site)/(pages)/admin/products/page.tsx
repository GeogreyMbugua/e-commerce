"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGate from "@/components/Admin/AdminGate";
import AdminShell from "@/components/Admin/AdminShell";
import ProductFilters, {
  type ProductFilterValues,
} from "@/components/Admin/ProductFilters";
import ProductsTable from "@/components/Admin/ProductsTable";
import { listAdminProducts } from "@/lib/admin-catalog";
import { adminProductNewPath } from "@/lib/routes";
import type { AdminProductDetail } from "@/types/admin-catalog";

const defaultFilters: ProductFilterValues = {
  search: "",
  category: "",
  status: "",
  availability: "",
};

export default function AdminProductsPage() {
  const [filters, setFilters] = useState<ProductFilterValues>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<AdminProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const load = useCallback(
    async (cursor?: string) => {
      const appending = Boolean(cursor);
      if (appending) setLoadingMore(true);
      else setLoading(true);

      try {
        const response = await listAdminProducts({
          search: debouncedSearch || undefined,
          category: filters.category || undefined,
          status: filters.status || undefined,
          availability: filters.availability || undefined,
          cursor,
          limit: 20,
        });
        setProducts((prev) =>
          appending ? [...prev, ...response.data] : response.data,
        );
        setNextCursor(response.page.nextCursor);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load products",
        );
        if (!appending) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      debouncedSearch,
      filters.category,
      filters.status,
      filters.availability,
    ],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminGate>
      <AdminShell
        title="Products"
        actions={
          <Link
            href={adminProductNewPath}
            className="rounded-md bg-brand-ink px-3 py-2 text-sm font-medium text-white hover:bg-brand-rust"
          >
            Add product
          </Link>
        }
      >
        <ProductFilters value={filters} onChange={setFilters} />
        <ProductsTable
          products={products}
          loading={loading}
          onUpdated={() => void load()}
        />
        {nextCursor ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void load(nextCursor)}
              className="rounded-md border border-brand-ink/15 bg-white px-4 py-2 text-sm disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </AdminShell>
    </AdminGate>
  );
}
