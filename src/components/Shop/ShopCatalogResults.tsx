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

const ShopCatalogResults = ({
  products,
  productStyle,
  loading,
  error,
  gridClassName = "grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-7.5 lg:grid-cols-3",
}: ShopCatalogResultsProps) => {
  if (loading) {
    return (
      <div className="rounded-lg bg-white px-6 py-10 text-center text-brand-ink/70 shadow-1">
        Loading the collection...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-brand-rust/20 bg-white px-6 py-10 text-center text-brand-ink shadow-1">
        <p className="font-medium text-brand-ink">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-lg bg-white px-6 py-10 text-center shadow-1">
        <p className="font-medium text-brand-ink">No products matched your search.</p>
        <p className="mt-2 text-custom-sm text-brand-ink/70">
          Try clearing your filters or searching with a broader term.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        productStyle === "grid" ? gridClassName : "flex flex-col gap-7.5"
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
