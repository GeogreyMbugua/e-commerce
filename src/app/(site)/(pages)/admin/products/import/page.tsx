"use client";

import AdminGate from "@/components/Admin/AdminGate";
import AdminShell from "@/components/Admin/AdminShell";
import ProductImportWizard from "@/components/Admin/ProductImportWizard";

export default function AdminProductImportPage() {
  return (
    <AdminGate>
      <AdminShell title="Import products">
        <ProductImportWizard />
      </AdminShell>
    </AdminGate>
  );
}
