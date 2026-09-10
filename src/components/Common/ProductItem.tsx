"use client";

import React, { useState } from "react";
import Image from "@/components/Common/BrandedImage";
import { Product } from "@/types/product";
import { addProductToCart } from "@/lib/cart-service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { getProductPreviewAlt, getProductPreviewUrl } from "@/lib/product-images";
import { productHref } from "@/lib/routes";
import {
  conditionLabel,
  formatProductPrice,
} from "@/lib/product-display";

type ProductItemProps = {
  item: Product;
  compact?: boolean;
  priority?: boolean;
};

const ProductItem = ({ item, compact = false, priority = false }: ProductItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const detailHref = productHref(item.slug);
  const previewImage = getProductPreviewUrl(item);
  const previewAlt = getProductPreviewAlt(item);
  const condition = conditionLabel(item.conditionGrade);
  const categoryTitle = item.categoryName ?? null;
  const hasDiscount = item.price > item.discountedPrice;
  const soldOut = item.isAvailable === false;

  const handleAddToCart = async () => {
    if (!item.slug || soldOut || adding) {
      return;
    }

    setAdding(true);
    try {
      await addProductToCart(dispatch, { slug: item.slug, quantity: 1 });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group flex h-full flex-col">
      <div className="relative mb-2 overflow-hidden bg-gradient-to-b from-[#fbf8f2] to-[#efe6d8] shadow-[inset_0_0_0_1px_rgba(37,36,42,0.06)]">
        <Link
          href={detailHref}
          className={`relative flex items-center justify-center p-2.5 sm:p-3 ${
            compact ? "aspect-square" : "aspect-[4/5] sm:aspect-square"
          }`}
        >
          <Image
            src={previewImage}
            alt={previewAlt}
            width={320}
            height={320}
            priority={priority}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          />
        </Link>

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {soldOut ? (
            <span className="bg-brand-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sold out
            </span>
          ) : null}
          {hasDiscount && !soldOut ? (
            <span className="bg-brand-red px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sale
            </span>
          ) : null}
          {condition && !soldOut ? (
            <span className="bg-brand-cream/95 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink">
              {condition}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || adding}
          aria-label={soldOut ? "Sold out" : `Add ${item.title} to cart`}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center bg-brand-rust text-white transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:bg-brand-ink/30"
        >
          {added ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 3.25v9.5M3.25 8h9.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        {categoryTitle ? (
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-ink/55">
            {categoryTitle}
          </p>
        ) : null}

        <h3 className="mb-1 text-sm font-medium leading-snug text-brand-ink transition-colors hover:text-brand-rust sm:text-[15px]">
          <Link href={detailHref} className="line-clamp-2">
            {item.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-brand-rust sm:text-base">
            {formatProductPrice(item.discountedPrice)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-brand-ink/50 line-through">
              {formatProductPrice(item.price)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
