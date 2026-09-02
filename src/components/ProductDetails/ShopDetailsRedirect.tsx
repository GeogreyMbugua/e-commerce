"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { shopPath } from "@/lib/routes";

export default function ShopDetailsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(shopPath);
  }, [router]);

  return (
    <div className="mx-auto max-w-[1170px] px-4 py-20 text-center">
      <p className="text-brand-ink/70">Redirecting to shop…</p>
    </div>
  );
}
