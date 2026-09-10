"use client";

import SingleGridItem from "@/components/Shop/SingleGridItem";
import SingleListItem from "@/components/Shop/SingleListItem";
import type { Product } from "@/types/product";

type ShopCatalogResultsProps = {
  products: Product[];
  productStyle: "grid" | "list";
  loading: boolean;
  error: string | null;
  gridClassName?: string;
};

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="mb-2 aspect-square bg-brand-ink/8" />
        <div className="mb-1.5 h-3 w-1/3 bg-brand-ink/8" />
        <div className="mb-2 h-4 w-4/5 bg-brand-ink/8" />
        <div className="h-4 w-1/4 bg-brand-ink/8" />
      </div>
    ))}
  </div>
);

const ShopCatalogResults = ({
  products,
  productStyle,
  loading,
  error,
  gridClassName = "grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-3",
}: ShopCatalogResultsProps) => {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  if (error) {
    return (
      <div className="border border-brand-rust/25 bg-white/60 px-5 py-10 text-center">
        <p className="font-medium text-brand-ink">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="border border-brand-ink/10 bg-white/50 px-5 py-12 text-center">
        <p className="font-medium text-brand-ink">No products found</p>
        <p className="mt-2 text-sm text-brand-ink/65">
          Try another category or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        productStyle === "grid" ? gridClassName : "flex flex-col gap-4 sm:gap-5"
      }
    >
      {products.map((item) =>
        productStyle === "grid" ? (
          <SingleGridItem item={item} key={item.slug} />
        ) : (
          <SingleListItem item={item} key={item.slug} />
        ),
      )}
    </div>
  );
};

export default ShopCatalogResults;
