"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGate from "@/components/Admin/AdminGate";
import AdminShell from "@/components/Admin/AdminShell";
import ProductForm from "@/components/Admin/ProductForm";
import {
  createAdminProduct,
  publishAdminProduct,
} from "@/lib/admin-catalog";
import { adminProductEditPath } from "@/lib/routes";
import type {
  CreateAdminProductInput,
  UpdateAdminProductInput,
} from "@/types/admin-catalog";

export default function AdminProductNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const saveDraft = async (
    payload: CreateAdminProductInput | UpdateAdminProductInput,
  ) => {
    setSubmitting(true);
    try {
      const product = await createAdminProduct({
        ...(payload as CreateAdminProductInput),
        status: "DRAFT",
      });
      toast.success("Draft saved");
      router.replace(adminProductEditPath(product.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save draft",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const publish = async (
    payload: CreateAdminProductInput | UpdateAdminProductInput,
  ) => {
    setSubmitting(true);
    try {
      const product = await createAdminProduct({
        ...(payload as CreateAdminProductInput),
        status: "DRAFT",
      });
      await publishAdminProduct(product.id);
      toast.success("Product published");
      router.replace(adminProductEditPath(product.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to publish product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminGate>
      <AdminShell title="New product">
        <p className="mb-4 text-sm text-brand-ink/60">
          Save a draft first, then add images on the edit screen.
        </p>
        <ProductForm
          mode="create"
          submitting={submitting}
          onSaveDraft={saveDraft}
          onPublish={publish}
        />
      </AdminShell>
    </AdminGate>
  );
}
