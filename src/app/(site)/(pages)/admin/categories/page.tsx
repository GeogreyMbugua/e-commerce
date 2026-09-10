"use client";

import AdminGate from "@/components/Admin/AdminGate";
import AdminShell from "@/components/Admin/AdminShell";
import CategoriesManager from "@/components/Admin/CategoriesManager";

export default function AdminCategoriesPage() {
  return (
    <AdminGate>
      <AdminShell title="Categories">
        <CategoriesManager />
      </AdminShell>
    </AdminGate>
  );
}
