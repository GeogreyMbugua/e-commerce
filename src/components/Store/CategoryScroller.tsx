"use client";

import Link from "next/link";
import Image from "@/components/Common/BrandedImage";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import {
  getCategoryInitial,
  getCategoryShortLabel,
  resolveCategoryImage,
} from "@/lib/category-display";
import { shopPath } from "@/lib/routes";

const CategoryScroller = () => {
  const { categories, loading } = useCatalogCategories();

  return (
    <section aria-label="Shop categories" className="pt-4 sm:pt-5">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="no-scrollbar -mx-4 flex snap-x gap-[clamp(0.75rem,3vw,1.25rem)] overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:gap-5 sm:overflow-visible sm:px-0 md:grid md:grid-cols-5 lg:grid-cols-9 lg:gap-4">
          <Link
            href={shopPath}
            className="group flex w-[clamp(3.5rem,15vw,4rem)] shrink-0 snap-start flex-col items-center gap-2 text-center lg:w-auto"
          >
            <span className="flex aspect-square w-[clamp(3rem,13vw,3.5rem)] items-center justify-center bg-brand-ink text-[11px] font-semibold tracking-wide text-brand-cream transition-opacity group-hover:opacity-85">
              All
            </span>
            <span className="text-[11px] font-medium text-brand-ink sm:text-xs">
              All
            </span>
          </Link>

          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex w-[clamp(3.5rem,15vw,4rem)] shrink-0 flex-col items-center gap-2 lg:w-auto"
                >
                  <span className="aspect-square w-[clamp(3rem,13vw,3.5rem)] animate-pulse bg-brand-cream" />
                  <span className="h-3 w-10 animate-pulse rounded bg-brand-cream" />
                </div>
              ))
            : categories.map((category) => {
                const image = resolveCategoryImage(category);
                const label = getCategoryShortLabel(category.slug, category.name);

                return (
                  <Link
                    key={category.slug}
                    href={`${shopPath}?category=${category.slug}`}
                    className="group flex w-[clamp(3.5rem,15vw,4rem)] shrink-0 snap-start flex-col items-center gap-2 text-center lg:w-auto"
                  >
                    <span className="relative aspect-square w-[clamp(3rem,13vw,3.5rem)] overflow-hidden bg-brand-cream">
                      {image ? (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-ink/70">
                          {getCategoryInitial(category.name)}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-brand-ink transition-colors group-hover:text-brand-rust sm:text-xs">
                      {label}
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default CategoryScroller;
