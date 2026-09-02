"use client";

import React, { Suspense, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import ShopCatalogResults from "../Shop/ShopCatalogResults";
import { useShopCatalog } from "@/hooks/useShopCatalog";
import type { CatalogSort } from "@/types/catalog";

const sortOptions: Array<{ label: string; value: CatalogSort }> = [
  { label: "Latest Products", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const ShopWithoutSidebarContent = () => {
  const { products, loading, error, filters, updateFilters } = useShopCatalog();
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");

  return (
    <>
      <Breadcrumb title={"Shop Audio & Physical Media"} pages={["shop"]} />
      <section className="relative overflow-hidden bg-brand-cream/40 pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="w-full">
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
              gridClassName="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-7.5 lg:grid-cols-4"
            />
          </div>
        </div>
      </section>
    </>
  );
};

const ShopWithoutSidebar = () => {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-20 text-center text-brand-ink/70">
          Loading the shop...
        </div>
      }
    >
      <ShopWithoutSidebarContent />
    </Suspense>
  );
};

export default ShopWithoutSidebar;
