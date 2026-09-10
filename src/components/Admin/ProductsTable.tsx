"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import type { AdminProductDetail } from "@/types/admin-catalog";
import {
  adminProductEditPath,
  productPath,
} from "@/lib/routes";
import {
  archiveAdminProduct,
  markAdminProductSold,
  markAdminProductUnavailable,
  minorToMajor,
  publishAdminProduct,
  unpublishAdminProduct,
} from "@/lib/admin-catalog";
import ProductStatusBadge from "@/components/Admin/ProductStatusBadge";

type ProductsTableProps = {
  products: AdminProductDetail[];
  loading?: boolean;
  onUpdated: () => void;
};

const formatPrice = (product: AdminProductDetail) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  }).format(minorToMajor(product.priceMinor));

export default function ProductsTable({
  products,
  loading,
  onUpdated,
}: ProductsTableProps) {
  const runStatusAction = async (
    product: AdminProductDetail,
    action: "publish" | "unpublish" | "unavailable" | "sold" | "archive",
  ) => {
    if (action === "sold") {
      if (
        !window.confirm(
          `Mark "${product.title}" as sold? This cannot be undone from the storefront.`,
        )
      ) {
        return;
      }
    }
    if (action === "archive") {
      if (!window.confirm(`Archive "${product.title}"?`)) {
        return;
      }
    }

    try {
      if (action === "publish") await publishAdminProduct(product.id);
      if (action === "unpublish") await unpublishAdminProduct(product.id);
      if (action === "unavailable")
        await markAdminProductUnavailable(product.id);
      if (action === "sold") await markAdminProductSold(product.id);
      if (action === "archive") await archiveAdminProduct(product.id);
      toast.success("Product updated");
      onUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update product",
      );
    }
  };

  if (loading) {
    return (
      <p className="rounded-lg border border-brand-ink/10 bg-white p-6 text-sm text-brand-ink/60">
        Loading products…
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-ink/20 bg-white p-8 text-center">
        <p className="text-brand-ink/80">
          No products yet. Add your first product.
        </p>
        <Link
          href="/admin/products/new"
          className="mt-3 inline-block text-sm font-medium text-brand-rust hover:underline"
        >
          Add product
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-brand-ink/10 bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-brand-ink/5 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-ink">
                    {product.title}
                  </div>
                  <div className="text-xs text-brand-ink/50">
                    {product.sku || product.slug}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-ink/75">
                  {product.category.name}
                </td>
                <td className="px-4 py-3">{formatPrice(product)}</td>
                <td className="px-4 py-3">
                  <ProductStatusBadge status={product.status} />
                </td>
                <td className="px-4 py-3 text-brand-ink/75">
                  {product.inventory?.quantityAvailable ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <ActionMenu product={product} onAction={runStatusAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border border-brand-ink/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-brand-ink">{product.title}</h3>
                <p className="mt-0.5 text-xs text-brand-ink/50">
                  {product.category.name}
                  {product.sku ? ` · ${product.sku}` : ""}
                </p>
              </div>
              <ProductStatusBadge status={product.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-medium">{formatPrice(product)}</span>
              <span className="text-brand-ink/55">
                Qty {product.inventory?.quantityAvailable ?? "—"}
              </span>
            </div>
            <div className="mt-3">
              <ActionMenu product={product} onAction={runStatusAction} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ActionMenu({
  product,
  onAction,
}: {
  product: AdminProductDetail;
  onAction: (
    product: AdminProductDetail,
    action: "publish" | "unpublish" | "unavailable" | "sold" | "archive",
  ) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={productPath(product.slug)}
        className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium hover:bg-brand-cream"
        target="_blank"
      >
        View
      </Link>
      <Link
        href={adminProductEditPath(product.id)}
        className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium hover:bg-brand-cream"
      >
        Edit
      </Link>
      {product.status === "DRAFT" || product.status === "UNAVAILABLE" ? (
        <button
          type="button"
          onClick={() => onAction(product, "publish")}
          className="rounded-md bg-brand-teal px-2.5 py-1 text-xs font-medium text-white"
        >
          Publish Product
        </button>
      ) : null}
      {product.status === "ACTIVE" ? (
        <>
          <button
            type="button"
            onClick={() => onAction(product, "unavailable")}
            className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs"
          >
            Mark Unavailable
          </button>
          <button
            type="button"
            onClick={() => onAction(product, "sold")}
            className="rounded-md border border-brand-rust/40 px-2.5 py-1 text-xs text-brand-rust"
          >
            Mark as Sold
          </button>
        </>
      ) : null}
      {product.status !== "ARCHIVED" && product.status !== "DRAFT" ? (
        <button
          type="button"
          onClick={() => onAction(product, "archive")}
          className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs text-brand-ink/60"
        >
          Archive Product
        </button>
      ) : null}
      {product.status === "ACTIVE" ? (
        <button
          type="button"
          onClick={() => onAction(product, "unpublish")}
          className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs"
        >
          Unpublish
        </button>
      ) : null}
    </div>
  );
}
