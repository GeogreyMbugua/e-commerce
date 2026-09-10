"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AdminGate from "@/components/Admin/AdminGate";
import AdminShell from "@/components/Admin/AdminShell";
import ProductForm from "@/components/Admin/ProductForm";
import ProductMediaManager from "@/components/Admin/ProductMediaManager";
import {
  archiveAdminProduct,
  getAdminProduct,
  markAdminProductSold,
  markAdminProductUnavailable,
  publishAdminProduct,
  updateAdminProduct,
} from "@/lib/admin-catalog";
import { adminProductsPath } from "@/lib/routes";
import type {
  AdminProductDetail,
  CreateAdminProductInput,
  UpdateAdminProductInput,
} from "@/types/admin-catalog";

function AdminProductEditInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAdminProduct(id);
      setProduct(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load product",
      );
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveChanges = async (
    payload: CreateAdminProductInput | UpdateAdminProductInput,
  ) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const updated = await updateAdminProduct(
        id,
        payload as UpdateAdminProductInput,
      );
      setProduct(updated);
      toast.success("Changes saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save changes",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const publish = async (
    payload: CreateAdminProductInput | UpdateAdminProductInput,
  ) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await updateAdminProduct(id, payload as UpdateAdminProductInput);
      const updated = await publishAdminProduct(id);
      setProduct(updated);
      toast.success("Product published");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to publish product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (
    action: "unavailable" | "sold" | "archive",
  ) => {
    if (!id || !product) return;
    if (action === "sold" && !window.confirm("Mark this product as sold?")) {
      return;
    }
    if (action === "archive" && !window.confirm("Archive this product?")) {
      return;
    }
    try {
      let updated: AdminProductDetail;
      if (action === "unavailable") {
        updated = await markAdminProductUnavailable(id);
      } else if (action === "sold") {
        updated = await markAdminProductSold(id);
      } else {
        updated = await archiveAdminProduct(id);
      }
      setProduct(updated);
      toast.success("Product updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update status",
      );
    }
  };

  if (!id) {
    return (
      <AdminShell title="Edit product">
        <p className="text-sm text-brand-ink/70">
          Missing product id.{" "}
          <button
            type="button"
            className="text-brand-rust hover:underline"
            onClick={() => router.push(adminProductsPath)}
          >
            Back to products
          </button>
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={product?.title ? `Edit: ${product.title}` : "Edit product"}
      actions={
        product ? (
          <div className="hidden flex-wrap gap-2 sm:flex">
            {product.status === "ACTIVE" ? (
              <>
                <button
                  type="button"
                  onClick={() => void runAction("unavailable")}
                  className="rounded-md border border-brand-ink/15 px-2.5 py-1.5 text-xs"
                >
                  Mark Unavailable
                </button>
                <button
                  type="button"
                  onClick={() => void runAction("sold")}
                  className="rounded-md border border-brand-rust/40 px-2.5 py-1.5 text-xs text-brand-rust"
                >
                  Mark as Sold
                </button>
              </>
            ) : null}
            {product.status !== "ARCHIVED" ? (
              <button
                type="button"
                onClick={() => void runAction("archive")}
                className="rounded-md border border-brand-ink/15 px-2.5 py-1.5 text-xs text-brand-ink/60"
              >
                Archive Product
              </button>
            ) : null}
          </div>
        ) : null
      }
    >
      {loading ? (
        <p className="text-sm text-brand-ink/60">Loading product…</p>
      ) : !product ? (
        <p className="text-sm text-brand-ink/70">Product not found.</p>
      ) : (
        <div className="space-y-6">
          <ProductMediaManager
            productId={product.id}
            media={product.media}
            onChange={setProduct}
          />
          <ProductForm
            mode="edit"
            product={product}
            submitting={submitting}
            onSaveDraft={saveChanges}
            onSaveChanges={saveChanges}
            onPublish={publish}
          />
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminProductEditPage() {
  return (
    <AdminGate>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-brand-ink/60">
            Loading…
          </div>
        }
      >
        <AdminProductEditInner />
      </Suspense>
    </AdminGate>
  );
}
