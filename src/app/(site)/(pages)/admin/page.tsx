"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminGate from "@/components/Admin/AdminGate";
import { adminProductsPath } from "@/lib/routes";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(adminProductsPath);
  }, [router]);

  return (
    <AdminGate>
      <div className="flex min-h-screen items-center justify-center text-sm text-brand-ink/60">
        Redirecting to products…
      </div>
    </AdminGate>
  );
}
