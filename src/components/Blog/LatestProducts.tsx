"use client";

import React from "react";
import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import { getProductPreviewAlt, getProductPreviewUrl } from "@/lib/product-images";
import { productHref } from "@/lib/routes";
import type { Product } from "@/types/product";

type LatestProductsProps = {
  products?: Product[];
  limit?: number;
};

const LatestProducts = ({ products: productsProp, limit = 3 }: LatestProductsProps) => {
  const { products: fetchedProducts, loading } = useCatalogProducts({
    limit,
    sort: "newest",
  });

  const products = productsProp ?? fetchedProducts;

  return (
    <div className="mt-7.5 rounded-xl bg-white shadow-1">
      <div className="border-b border-gray-3 px-4 py-4.5 sm:px-6">
        <h2 className="text-lg font-medium text-dark">Latest Products</h2>
      </div>

      <div className="p-4 sm:p-6">
        {loading && productsProp === undefined && (
          <div className="flex flex-col gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-6">
                <div className="h-22.5 w-[90px] rounded-[10px] bg-gray-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-2" />
                  <div className="h-3 w-1/3 rounded bg-gray-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading || productsProp !== undefined ? (
          <div className="flex flex-col gap-6">
            {products.slice(0, limit).map((product) => (
              <div className="flex items-center gap-6" key={product.slug ?? product.id}>
                <div className="flex h-22.5 w-full max-w-[90px] items-center justify-center rounded-[10px] bg-gray-3">
                  <Image
                    src={getProductPreviewUrl(product)}
                    alt={getProductPreviewAlt(product)}
                    width={74}
                    height={74}
                    className="object-contain"
                  />
                </div>

                <div>
                  <h3 className="mb-1 font-medium text-dark ease-out duration-200 hover:text-blue">
                    <Link href={productHref(product.slug)}>
                      {product.title}
                    </Link>
                  </h3>
                  <p className="text-custom-sm">
                    Price: ${product.discountedPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LatestProducts;
