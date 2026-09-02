"use client";

import React, { Suspense, useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import PriceDropdown from "./PriceDropdown";
import ShopCatalogResults from "../Shop/ShopCatalogResults";
import { useShopCatalog } from "@/hooks/useShopCatalog";
import type { CatalogSort } from "@/types/catalog";

const sortOptions: Array<{ label: string; value: CatalogSort }> = [
  { label: "Latest Products", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

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
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const categoryOptions = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    productCount: category.productCount,
  }));

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.minPriceMinor !== undefined ||
      filters.maxPriceMinor !== undefined ||
      filters.sort !== "newest",
  );

  useEffect(() => {
    const handleStickyMenu = () => {
      setStickyMenu(window.scrollY >= 80);
    };

    handleStickyMenu();
    window.addEventListener("scroll", handleStickyMenu);

    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  return (
    <>
      <Breadcrumb title={"Shop Audio & Physical Media"} pages={["shop"]} />
      <section className="relative overflow-hidden bg-brand-cream/40 pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div
              className={`sidebar-content fixed w-full max-w-[310px] ease-out duration-200 xl:static xl:z-1 xl:max-w-[270px] xl:translate-x-0 ${
                productSidebar
                  ? "z-9999 h-screen translate-x-0 overflow-y-auto bg-white p-5"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                className={`absolute -right-12.5 flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-1 sm:-right-8 xl:hidden ${
                  stickyMenu
                    ? "top-35 sm:top-34.5 lg:top-20"
                    : "top-37 sm:top-39 lg:top-24"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25L20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75L4 6.75C3.58579 6.75 3.25 6.41421 3.25 6ZM3.25 12C3.25 11.5858 3.58579 11.25 4 11.25L20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75L4 12.75C3.58579 12.75 3.25 12.4142 3.25 12ZM4 17.25C3.58579 17.25 3.25 17.5858 3.25 18C3.25 18.4142 3.58579 18.75 4 18.75L20 18.75C20.4142 18.75 20.75 18.4142 20.75 18C20.75 17.5858 20.4142 17.25 20 17.25L4 17.25Z"
                    fill=""
                  />
                </svg>
              </button>

              <div className="flex flex-col gap-6">
                <div className="rounded-lg bg-white px-5 py-4 shadow-1">
                  <div className="flex items-center justify-between">
                    <p>Filters:</p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-custom-xs text-brand-rust hover:text-brand-ink"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <span className="text-custom-xs text-brand-ink/60">
                        Refine your search
                      </span>
                    )}
                  </div>
                  {filters.search ? (
                    <p className="mt-3 text-custom-sm text-brand-ink/70">
                      Search: <span className="text-brand-ink">{filters.search}</span>
                    </p>
                  ) : null}
                </div>

                <CategoryDropdown
                  categories={categoryOptions}
                  selectedSlug={filters.category}
                  onChange={(category) => updateFilters({ category })}
                />

                <PriceDropdown
                  minPriceMinor={filters.minPriceMinor}
                  maxPriceMinor={filters.maxPriceMinor}
                  onChange={({ minPriceMinor, maxPriceMinor }) =>
                    updateFilters({ minPriceMinor, maxPriceMinor })
                  }
                />
              </div>
            </div>

            <div className="w-full xl:max-w-[870px]">
              <div className="mb-6 rounded-lg bg-white py-2.5 pl-3 pr-2.5 shadow-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <CustomSelect
                      options={sortOptions}
                      value={filters.sort}
                      onChange={(sort) =>
                        updateFilters({ sort: sort as CatalogSort })
                      }
                    />

                    <p>
                      Showing{" "}
                      <span className="text-brand-ink">{products.length}</span>{" "}
                      Products
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "border-brand-rust bg-brand-rust text-white"
                          : "border-gray-3 bg-gray-1 text-dark"
                      } flex h-9 w-10.5 items-center justify-center rounded-[5px] border ease-out duration-200 hover:border-brand-rust hover:bg-brand-rust hover:text-white`}
                    >
                      Grid
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "border-brand-rust bg-brand-rust text-white"
                          : "border-gray-3 bg-gray-1 text-dark"
                      } flex h-9 w-10.5 items-center justify-center rounded-[5px] border ease-out duration-200 hover:border-brand-rust hover:bg-brand-rust hover:text-white`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              <ShopCatalogResults
                products={products}
                productStyle={productStyle}
                loading={loading}
                error={error}
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
        <div className="px-4 py-20 text-center text-brand-ink/70">
          Loading the shop...
        </div>
      }
    >
      <ShopWithSidebarContent />
    </Suspense>
  );
};

export default ShopWithSidebar;
