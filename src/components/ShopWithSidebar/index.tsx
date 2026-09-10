"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import ShopCatalogResults from "../Shop/ShopCatalogResults";
import { useShopCatalog } from "@/hooks/useShopCatalog";
import type { CatalogSort } from "@/types/catalog";

const sortOptions: Array<{ label: string; value: CatalogSort }> = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const shortCategoryLabel = (name: string) => {
  const map: Record<string, string> = {
    Speakers: "Speakers",
    Turntables: "Turntables",
    "Amplifiers & Receivers": "Amps",
    "Vinyl Records": "Vinyl",
    CDs: "CDs",
    Cassettes: "Cassettes",
    DVDs: "DVDs",
    "VHS Tapes": "VHS",
  };
  return map[name] ?? name.split(" ")[0];
};

const ShopWithSidebarContent = () => {
  const {
    products,
    categories,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
  } = useShopCatalog();
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const handleShopControls = () => {
      setFilterOpen(true);
      requestAnimationFrame(() => {
        document.getElementById("shop-controls")?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    };

    window.addEventListener("shop:open-controls", handleShopControls);
    return () => window.removeEventListener("shop:open-controls", handleShopControls);
  }, []);

  const categoryOptions = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    productCount: category.productCount,
  }));

  const selectedCategoryName = useMemo(
    () => categoryOptions.find((c) => c.slug === filters.category)?.name,
    [categoryOptions, filters.category],
  );

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.minPriceMinor !== undefined ||
      filters.maxPriceMinor !== undefined,
  );

  const FiltersPanel = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex flex-col ${compact ? "gap-5" : "gap-6"}`}>
      <div className="border border-brand-ink/10 bg-white/70 px-4 py-3">
        <p className="mb-2 text-sm font-medium text-brand-ink">Sort by</p>
        <CustomSelect
          options={sortOptions}
          value={filters.sort}
          onChange={(sort) => updateFilters({ sort: sort as CatalogSort })}
        />
      </div>

      {!compact ? (
        <div className="border border-brand-ink/10 bg-white/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-ink">Filters</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-brand-rust hover:text-brand-ink"
              >
                Clear all
              </button>
            ) : (
              <span className="text-xs text-brand-ink/55">Refine results</span>
            )}
          </div>
          {filters.search ? (
            <p className="mt-2 text-sm text-brand-ink/70">
              Search: <span className="text-brand-ink">{filters.search}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {!compact ? (
        <CategoryDropdown
          categories={categoryOptions}
          selectedSlug={filters.category}
          onChange={(category) => updateFilters({ category })}
        />
      ) : null}

      <PriceDropdown
        minPriceMinor={filters.minPriceMinor}
        maxPriceMinor={filters.maxPriceMinor}
        onChange={({ minPriceMinor, maxPriceMinor }) =>
          updateFilters({ minPriceMinor, maxPriceMinor })
        }
        flat={compact}
      />
    </div>
  );

  return (
    <>
      {/* Compact shop header */}
      <div className="border-b border-brand-ink/10 bg-brand-cream/50">
        <div className="mx-auto flex w-full max-w-[1170px] items-end justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 xl:px-0">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-1 hidden text-xs text-brand-ink/55 sm:block">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/home" className="hover:text-brand-rust">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-brand-rust">Shop</li>
              </ol>
            </nav>
            <h1 className="truncate text-lg font-semibold text-brand-ink sm:text-xl lg:text-2xl">
              {selectedCategoryName ?? (filters.search ? `“${filters.search}”` : "Shop")}
            </h1>
          </div>
          <p className="shrink-0 pb-0.5 text-sm text-brand-ink/60">
            {loading ? "…" : `${products.length} items`}
          </p>
        </div>
      </div>

      <section className="relative pb-24 pt-3 sm:pb-10 sm:pt-5 lg:pb-16 lg:pt-8 xl:pb-16">
        <div
          className="pointer-events-none absolute inset-0 store-band--warm"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          {/* Mobile category chips */}
          <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-0.5 xl:hidden">
            <button
              type="button"
              onClick={() => updateFilters({ category: undefined })}
              className={`shrink-0 px-3.5 py-2 text-xs font-medium transition-colors ${
                !filters.category
                  ? "bg-brand-ink text-brand-cream"
                  : "bg-white/70 text-brand-ink"
              }`}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  updateFilters({
                    category:
                      filters.category === category.slug
                        ? undefined
                        : category.slug,
                  })
                }
                className={`shrink-0 px-3.5 py-2 text-xs font-medium transition-colors ${
                  filters.category === category.slug
                    ? "bg-brand-ink text-brand-cream"
                    : "bg-white/70 text-brand-ink"
                }`}
              >
                {shortCategoryLabel(category.name)}
              </button>
            ))}
          </div>

          {/* Active filter chips */}
          {(filters.search ||
            filters.minPriceMinor !== undefined ||
            filters.maxPriceMinor !== undefined) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 xl:hidden">
              {filters.search ? (
                <button
                  type="button"
                  onClick={() => updateFilters({ search: undefined })}
                  className="inline-flex items-center gap-1.5 bg-brand-ink/5 px-2.5 py-1.5 text-xs text-brand-ink"
                >
                  “{filters.search}”
                  <span aria-hidden="true">×</span>
                </button>
              ) : null}
              {(filters.minPriceMinor !== undefined ||
                filters.maxPriceMinor !== undefined) && (
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({
                      minPriceMinor: undefined,
                      maxPriceMinor: undefined,
                    })
                  }
                  className="inline-flex items-center gap-1.5 bg-brand-ink/5 px-2.5 py-1.5 text-xs text-brand-ink"
                >
                  Price
                  <span aria-hidden="true">×</span>
                </button>
              )}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-brand-rust"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          )}

          <div id="shop-controls" className="mb-4 xl:hidden">
            {filterOpen ? (
              <div className="border-y border-brand-ink/10 bg-white/55 px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-ink">Filter & sort</p>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="text-xs font-medium text-brand-rust"
                  >
                    Done
                  </button>
                </div>
                <FiltersPanel compact />
              </div>
            ) : null}
          </div>

          <div className="flex gap-7.5">
            <aside className="hidden w-full max-w-[270px] xl:block">
              <FiltersPanel />
            </aside>

            <div className="w-full xl:max-w-[870px]">
              {/* Desktop toolbar */}
              <div className="mb-5 hidden items-center justify-between gap-4 border-b border-brand-ink/10 pb-4 xl:flex">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-brand-ink/65">
                    <span className="font-medium text-brand-ink">
                      {products.length}
                    </span>{" "}
                    products
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setProductStyle("grid")}
                    aria-label="Grid view"
                    aria-pressed={productStyle === "grid"}
                    className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                      productStyle === "grid"
                        ? "border-brand-ink bg-brand-ink text-white"
                        : "border-brand-ink/15 text-brand-ink hover:border-brand-rust"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <rect x="0" y="0" width="5.5" height="5.5" />
                      <rect x="8.5" y="0" width="5.5" height="5.5" />
                      <rect x="0" y="8.5" width="5.5" height="5.5" />
                      <rect x="8.5" y="8.5" width="5.5" height="5.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductStyle("list")}
                    aria-label="List view"
                    aria-pressed={productStyle === "list"}
                    className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                      productStyle === "list"
                        ? "border-brand-ink bg-brand-ink text-white"
                        : "border-brand-ink/15 text-brand-ink hover:border-brand-rust"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <rect x="0" y="1" width="14" height="2" />
                      <rect x="0" y="6" width="14" height="2" />
                      <rect x="0" y="11" width="14" height="2" />
                    </svg>
                  </button>
                </div>
              </div>

              <ShopCatalogResults
                products={products}
                productStyle={productStyle}
                loading={loading}
                error={error}
                gridClassName="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-3"
              />
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

const ShopWithSidebar = () => {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-center text-sm text-brand-ink/70">
          Loading the shop…
        </div>
      }
    >
      <ShopWithSidebarContent />
    </Suspense>
  );
};

export default ShopWithSidebar;
