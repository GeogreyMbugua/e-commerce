"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Image from "@/components/Common/BrandedImage";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { toViewProduct } from "@/lib/catalog-adapter";
import { shopPath } from "@/lib/routes";
import { updateproductDetails } from "@/redux/features/product-details";
import { addProductToCart } from "@/lib/cart-service";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import type { AppDispatch } from "@/redux/store";
import type { CatalogProductDetail } from "@/types/catalog";

const formatMoney = (minor: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(minor / 100);

const conditionLabel = (grade: string) =>
  grade.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

type ProductDetailsViewProps = {
  product: CatalogProductDetail;
};

const ProductDetailsView = ({ product }: ProductDetailsViewProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const [previewIndex, setPreviewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "condition" | "specs">(
    "description",
  );

  const images =
    product.images.length > 0
      ? product.images
      : product.primaryImage
        ? [product.primaryImage]
        : [];
  const viewProduct = toViewProduct(product);
  const listPrice = product.compareAtMinor ?? product.priceMinor;
  const hasDiscount = product.compareAtMinor !== null;

  useEffect(() => {
    dispatch(updateproductDetails(toViewProduct(product)));
  }, [dispatch, product]);

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(viewProduct));
    openPreviewModal();
  };

  const handleAddToCart = async () => {
    await addProductToCart(dispatch, {
      slug: product.slug,
      quantity,
    });
  };

  const handleAddToWishlist = () => {
    dispatch(
      addItemToWishlist({
        ...viewProduct,
        status: product.isAvailable ? "available" : "out_of_stock",
        quantity: 1,
      }),
    );
  };

  const specEntries =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications)
      : [];

  return (
    <>
      <Breadcrumb
        title={product.title}
        pages={["shop", product.category.name]}
      />

      <section className="relative overflow-hidden pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col gap-7.5 lg:flex-row xl:gap-17.5">
            <div className="w-full lg:max-w-[570px]">
              <div className="relative flex items-center justify-center rounded-lg bg-brand-cream p-4 shadow-1 sm:p-7.5 lg:min-h-[512px]">
                {images.length > 0 && (
                  <>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="Open image gallery"
                      className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-[5px] bg-white text-brand-ink shadow-1 duration-200 ease-out hover:text-brand-rust lg:right-6 lg:top-6"
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.11493 1.14581H9.16665C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665V9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <Image
                      src={images[previewIndex]?.url ?? images[0].url}
                      alt={images[previewIndex]?.altText ?? product.title}
                      width={400}
                      height={400}
                      className="max-h-[400px] w-full object-contain"
                    />
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-6 flex flex-wrap gap-4.5 sm:flex-nowrap">
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      onClick={() => setPreviewIndex(index)}
                      className={`flex h-15 w-15 items-center justify-center overflow-hidden rounded-lg bg-brand-cream shadow-1 duration-200 ease-out hover:border-brand-rust sm:h-25 sm:w-25 border-2 ${
                        index === previewIndex
                          ? "border-brand-rust"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText ?? product.title}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-[520px]">
              <Link
                href={shopPath}
                className="mb-3 inline-block text-custom-sm text-brand-ink/70 hover:text-brand-rust"
              >
                {product.category.name}
              </Link>

              <h1 className="mb-4 text-xl font-semibold text-brand-ink xl:text-heading-5">
                {product.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded bg-brand-rust/10 px-3 py-1 text-custom-sm font-medium text-brand-rust">
                  {conditionLabel(product.conditionGrade)}
                </span>
                {product.isUniqueItem && (
                  <span className="inline-block rounded bg-brand-ink/10 px-3 py-1 text-custom-sm font-medium text-brand-ink">
                    One of a kind
                  </span>
                )}
                <span
                  className={`inline-block rounded px-3 py-1 text-custom-sm font-medium ${
                    product.isAvailable
                      ? "bg-green/10 text-green"
                      : "bg-red/10 text-red"
                  }`}
                >
                  {product.isAvailable
                    ? `${product.availableQuantity} available`
                    : "Out of stock"}
                </span>
              </div>

              <div className="mb-7.5 flex items-center gap-4">
                <span className="text-2xl font-semibold text-brand-rust">
                  {formatMoney(product.priceMinor, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-brand-ink/60 line-through">
                    {formatMoney(listPrice, product.currency)}
                  </span>
                )}
              </div>

              <p className="mb-7.5 text-brand-ink/80">{product.description}</p>

              <div className="mb-7.5 flex items-center gap-4">
                <div className="flex items-center rounded-md border border-gray-3">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-11 w-11 items-center justify-center text-brand-ink hover:text-brand-rust"
                  >
                    −
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center border-x border-gray-3">
                    {quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((value) =>
                        product.isUniqueItem
                          ? 1
                          : Math.min(product.availableQuantity, value + 1),
                      )
                    }
                    disabled={!product.isAvailable}
                    className="flex h-11 w-11 items-center justify-center text-brand-ink hover:text-brand-rust disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-brand-rust px-8 py-3 font-medium text-white duration-200 hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add to cart
                </button>

                <button
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-3 text-brand-ink hover:border-brand-rust hover:text-brand-rust"
                >
                  ♥
                </button>
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-2 px-2.5 py-1 text-custom-xs text-brand-ink/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 border-t border-gray-3 pt-10">
            <div className="mb-6 flex flex-wrap gap-6 border-b border-gray-3">
              {(
                [
                  ["description", "Description"],
                  ["condition", "Condition & Testing"],
                  ["specs", "Specifications"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`pb-3 text-custom-sm font-medium duration-200 ${
                    activeTab === id
                      ? "border-b-2 border-brand-rust text-brand-rust"
                      : "text-brand-ink/60 hover:text-brand-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "description" && (
              <div className="prose max-w-none text-brand-ink/80">
                <p>{product.description}</p>
                {product.provenanceNotes && (
                  <>
                    <h3 className="mt-6 text-lg font-medium text-brand-ink">
                      Provenance
                    </h3>
                    <p>{product.provenanceNotes}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === "condition" && (
              <dl className="grid gap-4 sm:grid-cols-2">
                {product.conditionNotes && (
                  <div>
                    <dt className="font-medium text-brand-ink">Condition notes</dt>
                    <dd className="mt-1 text-brand-ink/80">
                      {product.conditionNotes}
                    </dd>
                  </div>
                )}
                {product.defects && (
                  <div>
                    <dt className="font-medium text-brand-ink">Known defects</dt>
                    <dd className="mt-1 text-brand-ink/80">{product.defects}</dd>
                  </div>
                )}
                {product.testingNotes && (
                  <div>
                    <dt className="font-medium text-brand-ink">Testing notes</dt>
                    <dd className="mt-1 text-brand-ink/80">
                      {product.testingNotes}
                    </dd>
                  </div>
                )}
                {product.restorationNotes && (
                  <div>
                    <dt className="font-medium text-brand-ink">
                      Restoration notes
                    </dt>
                    <dd className="mt-1 text-brand-ink/80">
                      {product.restorationNotes}
                    </dd>
                  </div>
                )}
                {!product.conditionNotes &&
                  !product.defects &&
                  !product.testingNotes &&
                  !product.restorationNotes && (
                    <p className="text-brand-ink/70">
                      Detailed condition notes will be added for this item soon.
                    </p>
                  )}
              </dl>
            )}

            {activeTab === "specs" && (
              <>
                {specEntries.length > 0 ? (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {specEntries.map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-medium capitalize text-brand-ink">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="mt-1 text-brand-ink/80">
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-brand-ink/70">
                    No specifications listed for this item.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsView;
