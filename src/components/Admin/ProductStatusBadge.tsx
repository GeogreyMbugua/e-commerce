import type { AdminProductStatus } from "@/types/admin-catalog";
import { PRODUCT_STATUS_LABELS } from "@/types/admin-catalog";

const STATUS_STYLES: Record<AdminProductStatus, string> = {
  DRAFT: "bg-brand-ink/10 text-brand-ink",
  ACTIVE: "bg-brand-teal/15 text-brand-teal",
  UNAVAILABLE: "bg-brand-gold/20 text-brand-ink",
  SOLD: "bg-brand-rust/15 text-brand-rust",
  ARCHIVED: "bg-gray-3 text-gray-6",
};

export default function ProductStatusBadge({
  status,
}: {
  status: AdminProductStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {PRODUCT_STATUS_LABELS[status]}
    </span>
  );
}
