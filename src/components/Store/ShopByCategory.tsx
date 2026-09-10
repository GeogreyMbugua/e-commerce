"use client";

import Link from "next/link";
import Image from "@/components/Common/BrandedImage";
import SectionHeader from "@/components/Store/SectionHeader";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import {
  getCategoryInitial,
  getCategoryShortLabel,
  resolveCategoryImage,
} from "@/lib/category-display";
import { shopPath } from "@/lib/routes";

const ShopByCategory = () => {
  const { categories, loading } = useCatalogCategories();

  return (
    <section id="shop-by-category" className="pt-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionHeader title="Shop by Category" href={shopPath} actionLabel="Browse shop" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="mb-2.5 aspect-[4/3] bg-brand-cream" />
                  <div className="h-4 w-2/3 rounded bg-brand-cream" />
                </div>
              ))
            : categories.map((category) => {
                const image = resolveCategoryImage(category);
                const label = getCategoryShortLabel(category.slug, category.name);

                return (
                  <Link
                    key={category.slug}
                    href={`${shopPath}?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="relative mb-2.5 aspect-[4/3] overflow-hidden bg-brand-cream">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${category.name} collection`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-brand-ink/40">
                          {getCategoryInitial(category.name)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-brand-ink transition-colors group-hover:text-brand-rust sm:text-base">
                      {label}
                    </h3>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
