"use client";

import { useEffect, useState } from "react";
import type {
  AdminAvailabilityFilter,
  AdminCategoryDetail,
  AdminProductStatus,
} from "@/types/admin-catalog";
import { PRODUCT_STATUS_LABELS } from "@/types/admin-catalog";
import { listAdminCategories } from "@/lib/admin-catalog";

export type ProductFilterValues = {
  search: string;
  category: string;
  status: "" | AdminProductStatus;
  availability: "" | AdminAvailabilityFilter;
};

type ProductFiltersProps = {
  value: ProductFilterValues;
  onChange: (next: ProductFilterValues) => void;
};

const STATUS_OPTIONS: Array<"" | AdminProductStatus> = [
  "",
  "DRAFT",
  "ACTIVE",
  "UNAVAILABLE",
  "SOLD",
  "ARCHIVED",
];

const AVAILABILITY_OPTIONS: Array<{
  value: "" | AdminAvailabilityFilter;
  label: string;
}> = [
  { value: "", label: "Any availability" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "reserved", label: "Reserved" },
];

function FilterFields({
  value,
  onChange,
  categories,
}: {
  value: ProductFilterValues;
  onChange: (next: ProductFilterValues) => void;
  categories: AdminCategoryDetail[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-brand-ink/70">
          Search
        </label>
        <input
          type="search"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Title, brand, model…"
          className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-brand-ink/70">
          Category
        </label>
        <select
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-brand-ink/70">
          Status
        </label>
        <select
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as ProductFilterValues["status"],
            })
          }
          className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status || "all"} value={status}>
              {status ? PRODUCT_STATUS_LABELS[status] : "All statuses"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-brand-ink/70">
          Availability
        </label>
        <select
          value={value.availability}
          onChange={(e) =>
            onChange({
              ...value,
              availability: e.target
                .value as ProductFilterValues["availability"],
            })
          }
          className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value || "any"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function ProductFilters({
  value,
  onChange,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<AdminCategoryDetail[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void listAdminCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = [
    value.search,
    value.category,
    value.status,
    value.availability,
  ].filter(Boolean).length;

  return (
    <div className="mb-4">
      <div className="hidden rounded-lg border border-brand-ink/10 bg-white p-4 md:block">
        <FilterFields
          value={value}
          onChange={onChange}
          categories={categories}
        />
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-brand-ink/10 bg-white px-4 py-3 text-sm font-medium"
        >
          <span>Filters</span>
          {activeCount > 0 ? (
            <span className="rounded-full bg-brand-rust/15 px-2 py-0.5 text-xs text-brand-rust">
              {activeCount}
            </span>
          ) : (
            <span className="text-brand-ink/45">None</span>
          )}
        </button>

        {sheetOpen ? (
          <div className="fixed inset-0 z-40 flex flex-col justify-end bg-brand-ink/40">
            <button
              type="button"
              className="flex-1"
              aria-label="Close filters"
              onClick={() => setSheetOpen(false)}
            />
            <div className="max-h-[85vh] overflow-y-auto rounded-t-xl bg-white p-4 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="text-sm text-brand-ink/60"
                >
                  Done
                </button>
              </div>
              <FilterFields
                value={value}
                onChange={onChange}
                categories={categories}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
