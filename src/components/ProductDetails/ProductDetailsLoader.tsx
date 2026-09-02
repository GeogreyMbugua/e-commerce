"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProductBySlug } from "@/lib/catalog";
import { shopPath } from "@/lib/routes";
import type { CatalogProductDetail } from "@/types/catalog";
import ProductDetailsView from "./ProductDetailsView";

type ProductDetailsLoaderProps = {
  slug: string;
};

const ProductDetailsLoader = ({ slug }: ProductDetailsLoaderProps) => {
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProductBySlug(slug);
        if (!cancelled) {
          setProduct(data);
        }
      } catch {
        if (!cancelled) {
          setError("Product not found or unavailable.");
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | AudioVintage`;
    }
  }, [product?.title]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1170px] px-4 py-20 sm:px-8 xl:px-0">
        <div className="animate-pulse">
          <div className="mb-8 h-6 w-48 rounded bg-gray-2" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="h-[400px] flex-1 rounded-lg bg-gray-2" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-2" />
              <div className="h-6 w-1/3 rounded bg-gray-2" />
              <div className="h-24 w-full rounded bg-gray-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-[1170px] px-4 py-20 text-center sm:px-8 xl:px-0">
        <h1 className="mb-4 text-2xl font-semibold text-brand-ink">
          Product not found
        </h1>
        <p className="mb-8 text-brand-ink/70">
          This item may have sold or the link is incorrect.
        </p>
        <Link
          href={shopPath}
          className="inline-flex rounded-md bg-brand-rust px-6 py-3 font-medium text-white hover:bg-brand-ink"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return <ProductDetailsView product={product} />;
};

export default ProductDetailsLoader;
