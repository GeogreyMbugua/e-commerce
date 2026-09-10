"use client";

import React, { useEffect, useState } from "react";
import ProductItem from "@/components/Common/ProductItem";
import SectionHeader from "@/components/Store/SectionHeader";
import { fetchProducts } from "@/lib/catalog";
import { toViewProducts } from "@/lib/catalog-adapter";
import { shopPath } from "@/lib/routes";
import type { Product } from "@/types/product";

const Featured = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prefer explicitly featured catalogue items when the API returns any.
        const featuredResponse = await fetchProducts({
          featured: true,
          limit: 6,
          sort: "newest",
        });

        let list = featuredResponse.data;

        // Fall back to newest slice when no featured products are set.
        if (list.length === 0) {
          const newest = await fetchProducts({ limit: 6, sort: "newest" });
          list = newest.data;
        }

        if (!cancelled) {
          setProducts(toViewProducts(list));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load products.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="featured" className="pt-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Curated picks"
          title="Featured"
          href={shopPath}
        />

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mb-2.5 aspect-square bg-gray-2" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-2" />
                <div className="h-4 w-1/3 rounded bg-gray-2" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-brand-ink/70">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {products.map((item) => (
              <ProductItem item={item} key={item.slug ?? item.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Featured;
