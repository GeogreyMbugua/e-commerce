"use client";

import React from "react";
import SingleItem from "./SingleItem";
import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import { shopPath } from "@/lib/routes";

const BestSeller = () => {
  const { products, loading, error } = useCatalogProducts({
    limit: 8,
    sort: "newest",
  });

  const featured = products.slice(1, 7);

  return (
    <section className="overflow-hidden">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="mb-8 flex items-center justify-between sm:mb-10">
          <div>
            <span className="mb-1.5 flex items-center gap-2.5 font-medium text-brand-rust">
              <Image
                src="/images/icons/icon-07.svg"
                alt=""
                width={17}
                height={17}
                className="opacity-90"
              />
              This Month
            </span>
            <h2 className="text-xl font-semibold text-brand-ink xl:text-heading-5">
              Best Sellers
            </h2>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7.5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-lg bg-gray-2"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-brand-ink/70">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7.5 lg:grid-cols-3">
            {featured.map((item) => (
              <SingleItem item={item} key={item.slug ?? item.id} />
            ))}
          </div>
        )}

        <div className="mt-9 text-center sm:mt-12.5">
          <Link
            href={shopPath}
            className="inline-flex rounded-md border border-brand-ink/15 bg-brand-cream px-7 py-3 text-sm font-medium text-brand-ink transition-colors duration-200 hover:border-brand-rust hover:bg-brand-rust hover:text-white sm:px-12.5"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
