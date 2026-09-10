"use client";

import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import SectionHeader from "@/components/Store/SectionHeader";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import { shopPath } from "@/lib/routes";

const ProductGridSkeleton = ({ rail = false }: { rail?: boolean }) => {
  if (rail) {
    return (
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-[46%] shrink-0 animate-pulse sm:w-auto"
          >
            <div className="mb-2.5 aspect-square bg-gray-2" />
            <div className="mb-2 h-3 w-1/2 rounded bg-gray-2" />
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-2" />
            <div className="h-4 w-1/3 rounded bg-gray-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-2.5 aspect-square bg-gray-2" />
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-2" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-2" />
          <div className="h-4 w-1/3 rounded bg-gray-2" />
        </div>
      ))}
    </div>
  );
};

const NewArrival = () => {
  const { products, loading, error } = useCatalogProducts({
    limit: 8,
    sort: "newest",
  });

  return (
    <section id="new-arrivals" className="pt-8 sm:pt-10">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Just in"
          title="New Arrivals"
          href={`${shopPath}?sort=newest`}
        />

        {loading && <ProductGridSkeleton rail />}

        {!loading && error && (
          <p className="text-sm text-brand-ink/70">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* Mobile: horizontal product rail */}
            <div className="no-scrollbar -mx-4 grid auto-cols-[clamp(9.5rem,43vw,13rem)] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 sm:hidden">
              {products.map((item, index) => (
                    <div key={item.slug ?? item.id} className="min-w-0">
                  <ProductItem item={item} compact priority={index < 2} />
                </div>
              ))}
            </div>

            {/* Tablet/desktop: dense grid */}
            <div className="hidden grid-cols-2 gap-[clamp(0.75rem,2vw,1.25rem)] sm:grid lg:grid-cols-3 xl:grid-cols-4">
              {products.map((item, index) => (
                <ProductItem
                  item={item}
                  key={item.slug ?? item.id}
                  priority={index < 4}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewArrival;
