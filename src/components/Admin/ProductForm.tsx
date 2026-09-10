"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type {
  AdminCategoryDetail,
  AdminConditionGrade,
  AdminProductDetail,
  CreateAdminProductInput,
  UpdateAdminProductInput,
} from "@/types/admin-catalog";
import {
  CONDITION_GRADE_LABELS,
  PRODUCT_STATUS_LABELS,
} from "@/types/admin-catalog";
import {
  listAdminCategories,
  majorToMinor,
  minorToMajor,
} from "@/lib/admin-catalog";
import ProductStatusBadge from "@/components/Admin/ProductStatusBadge";

type SpecRow = { key: string; value: string };

export type ProductFormValues = {
  title: string;
  slug: string;
  sku: string;
  brand: string;
  model: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  priceMajor: string;
  compareAtMajor: string;
  currency: string;
  conditionGrade: AdminConditionGrade;
  conditionNotes: string;
  defects: string;
  testingNotes: string;
  restorationNotes: string;
  provenanceNotes: string;
  tags: string;
  quantityAvailable: string;
  isUniqueItem: boolean;
  isFeatured: boolean;
  specs: SpecRow[];
};

type ProductFormProps = {
  mode: "create" | "edit";
  product?: AdminProductDetail | null;
  submitting?: boolean;
  onSaveDraft: (payload: CreateAdminProductInput | UpdateAdminProductInput) => Promise<void>;
  onSaveChanges?: (payload: UpdateAdminProductInput) => Promise<void>;
  onPublish: (payload: CreateAdminProductInput | UpdateAdminProductInput) => Promise<void>;
};

const CONDITION_OPTIONS = Object.keys(
  CONDITION_GRADE_LABELS,
) as AdminConditionGrade[];

const emptyForm = (): ProductFormValues => ({
  title: "",
  slug: "",
  sku: "",
  brand: "",
  model: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  priceMajor: "",
  compareAtMajor: "",
  currency: "USD",
  conditionGrade: "GOOD",
  conditionNotes: "",
  defects: "",
  testingNotes: "",
  restorationNotes: "",
  provenanceNotes: "",
  tags: "",
  quantityAvailable: "1",
  isUniqueItem: true,
  isFeatured: false,
  specs: [{ key: "", value: "" }],
});

const fromProduct = (product: AdminProductDetail): ProductFormValues => {
  const specs = product.specifications
    ? Object.entries(product.specifications).map(([key, value]) => ({
        key,
        value: String(value ?? ""),
      }))
    : [{ key: "", value: "" }];

  return {
    title: product.title,
    slug: product.slug,
    sku: product.sku ?? "",
    brand: product.brand ?? "",
    model: product.model ?? "",
    categoryId: product.category.id,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    priceMajor: String(minorToMajor(product.priceMinor)),
    compareAtMajor:
      product.compareAtMinor != null
        ? String(minorToMajor(product.compareAtMinor))
        : "",
    currency: product.currency || "USD",
    conditionGrade: product.conditionGrade,
    conditionNotes: product.conditionNotes ?? "",
    defects: product.defects ?? "",
    testingNotes: product.testingNotes ?? "",
    restorationNotes: product.restorationNotes ?? "",
    provenanceNotes: product.provenanceNotes ?? "",
    tags: product.tags.join(", "),
    quantityAvailable: String(product.inventory?.quantityAvailable ?? 1),
    isUniqueItem: product.isUniqueItem,
    isFeatured: product.isFeatured,
    specs: specs.length ? specs : [{ key: "", value: "" }],
  };
};

const fieldClass =
  "w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15";
const labelClass = "mb-1 block text-xs font-medium text-brand-ink/70";
const sectionClass =
  "rounded-lg border border-brand-ink/10 bg-white p-4 sm:p-5";

export default function ProductForm({
  mode,
  product,
  submitting,
  onSaveDraft,
  onSaveChanges,
  onPublish,
}: ProductFormProps) {
  const [categories, setCategories] = useState<AdminCategoryDetail[]>([]);
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void listAdminCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data.filter((c) => c.isActive || mode === "edit"));
        }
      })
      .catch(() => toast.error("Unable to load categories"));
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (product) {
      setValues(fromProduct(product));
    }
  }, [product]);

  const statusLabel = useMemo(() => {
    if (!product) return PRODUCT_STATUS_LABELS.DRAFT;
    return PRODUCT_STATUS_LABELS[product.status];
  }, [product]);

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.title.trim()) next.title = "Title is required.";
    if (!values.description.trim())
      next.description = "Description is required.";
    if (!values.categoryId) next.categoryId = "Category is required.";
    const price = Number(values.priceMajor);
    if (!values.priceMajor.trim() || Number.isNaN(price) || price < 0) {
      next.priceMajor = "Enter a valid price.";
    }
    if (values.compareAtMajor.trim()) {
      const compare = Number(values.compareAtMajor);
      if (Number.isNaN(compare) || compare < 0) {
        next.compareAtMajor = "Enter a valid compare-at price.";
      }
    }
    if (values.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim())) {
      next.slug = "Slug must be lowercase kebab-case.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (
    includeStatus?: "DRAFT",
  ): CreateAdminProductInput | UpdateAdminProductInput => {
    const specs: Record<string, string> = {};
    values.specs.forEach((row) => {
      if (row.key.trim()) specs[row.key.trim()] = row.value;
    });

    const tags = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      sku: undefined,

      brand: values.brand.trim() || null,
      model: values.model.trim() || null,
      shortDescription: values.shortDescription.trim() || null,
      description: values.description.trim(),
      categoryId: values.categoryId,
      priceMinor: majorToMinor(Number(values.priceMajor)),
      compareAtMinor: values.compareAtMajor.trim()
        ? majorToMinor(Number(values.compareAtMajor))
        : null,
      currency: values.currency.trim() || "USD",
      conditionGrade: values.conditionGrade,
      conditionNotes: values.conditionNotes.trim() || null,
      defects: values.defects.trim() || null,
      testingNotes: values.testingNotes.trim() || null,
      restorationNotes: values.restorationNotes.trim() || null,
      provenanceNotes: values.provenanceNotes.trim() || null,
      specifications: Object.keys(specs).length ? specs : null,
      tags,
      isUniqueItem: values.isUniqueItem,
      isFeatured: values.isFeatured,
      quantityAvailable: Number(values.quantityAvailable) || 0,
      ...(includeStatus ? { status: includeStatus } : {}),
    };

    return base;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    await onSaveDraft(buildPayload(mode === "create" ? "DRAFT" : undefined));
  };

  const handleSaveChanges = async () => {
    if (!validate() || !onSaveChanges) return;
    await onSaveChanges(buildPayload() as UpdateAdminProductInput);
  };

  const handlePublish = async () => {
    if (!validate()) return;
    await onPublish(buildPayload());
  };

  return (
    <div className="space-y-4">
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Basic
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title</label>
            <input
              className={fieldClass}
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Slug (optional)</label>
            <input
              className={fieldClass}
              value={values.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="auto-generated if empty"
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
            ) : null}
          </div>
          {mode === "edit" && product?.sku ? (
            <div>
              <label className={labelClass}>Reference code</label>
              <p className="rounded-md border border-brand-ink/10 bg-brand-cream/40 px-3 py-2.5 text-sm text-brand-ink/70">
                {product.sku}
              </p>
              <p className="mt-1 text-xs text-brand-ink/45">
                Auto-assigned. Used for admin search only — shoppers never see
                this.
              </p>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Brand</label>
            <input
              className={fieldClass}
              value={values.brand}
              onChange={(e) => setField("brand", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              className={fieldClass}
              value={values.model}
              onChange={(e) => setField("model", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Category</label>
            <select
              className={fieldClass}
              value={values.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {!category.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short description</label>
            <input
              className={fieldClass}
              value={values.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              maxLength={500}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Pricing
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={fieldClass}
              value={values.priceMajor}
              onChange={(e) => setField("priceMajor", e.target.value)}
            />
            {errors.priceMajor ? (
              <p className="mt-1 text-xs text-red-600">{errors.priceMajor}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Compare-at price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={fieldClass}
              value={values.compareAtMajor}
              onChange={(e) => setField("compareAtMajor", e.target.value)}
            />
            {errors.compareAtMajor ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.compareAtMajor}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input
              className={fieldClass}
              value={values.currency}
              onChange={(e) => setField("currency", e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
          <div>
            <label className={labelClass}>How many do you have?</label>
            <input
              type="number"
              min="0"
              className={fieldClass}
              value={values.quantityAvailable}
              onChange={(e) => setField("quantityAvailable", e.target.value)}
            />
            <p className="mt-1 text-xs text-brand-ink/45">
              For most vintage pieces this is 1.
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Condition
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Condition grade</label>
            <select
              className={fieldClass}
              value={values.conditionGrade}
              onChange={(e) =>
                setField(
                  "conditionGrade",
                  e.target.value as AdminConditionGrade,
                )
              }
            >
              {CONDITION_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {CONDITION_GRADE_LABELS[grade]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Condition notes</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={values.conditionNotes}
              onChange={(e) => setField("conditionNotes", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Defects</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={values.defects}
              onChange={(e) => setField("defects", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Testing notes</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={values.testingNotes}
              onChange={(e) => setField("testingNotes", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Restoration notes</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={values.restorationNotes}
              onChange={(e) => setField("restorationNotes", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Provenance notes</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={values.provenanceNotes}
              onChange={(e) => setField("provenanceNotes", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Description
        </h2>
        <div>
          <label className={labelClass}>Full description</label>
          <textarea
            className={fieldClass}
            rows={6}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          ) : null}
        </div>
        <div className="mt-3">
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            className={fieldClass}
            value={values.tags}
            onChange={(e) => setField("tags", e.target.value)}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
            Specs
          </h2>
          <button
            type="button"
            onClick={() =>
              setField("specs", [...values.specs, { key: "", value: "" }])
            }
            className="text-xs font-medium text-brand-teal hover:underline"
          >
            Add row
          </button>
        </div>
        <div className="space-y-2">
          {values.specs.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                className={fieldClass}
                placeholder="Key"
                value={row.key}
                onChange={(e) => {
                  const specs = [...values.specs];
                  specs[index] = { ...row, key: e.target.value };
                  setField("specs", specs);
                }}
              />
              <input
                className={fieldClass}
                placeholder="Value"
                value={row.value}
                onChange={(e) => {
                  const specs = [...values.specs];
                  specs[index] = { ...row, value: e.target.value };
                  setField("specs", specs);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setField(
                    "specs",
                    values.specs.filter((_, i) => i !== index),
                  )
                }
                className="rounded-md border border-brand-ink/15 px-2 text-xs text-brand-ink/60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Storefront
        </h2>
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-brand-ink/60">Status:</span>
          {product ? (
            <ProductStatusBadge status={product.status} />
          ) : (
            <span className="text-brand-ink/80">{statusLabel}</span>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => setField("isFeatured", e.target.checked)}
            />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.isUniqueItem}
              onChange={(e) => setField("isUniqueItem", e.target.checked)}
            />
            One-of-a-kind piece
          </label>
        </div>
        <p className="mt-2 text-xs text-brand-ink/45">
          One-of-a-kind limits the cart to a single unit and helps prevent
          overselling at checkout.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-brand-ink/10 pt-4">
        {mode === "create" ? (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSaveDraft()}
            className="rounded-md border border-brand-ink/20 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            Save Draft
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSaveChanges()}
            className="rounded-md border border-brand-ink/20 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            Save Changes
          </button>
        )}
        {mode === "create" || product?.status === "DRAFT" ? (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handlePublish()}
            className="rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-rust disabled:opacity-60"
          >
            Publish Product
          </button>
        ) : null}
        {mode === "edit" && product?.status === "ACTIVE" ? (
          <p className="w-full text-xs text-brand-ink/50 sm:w-auto sm:self-center">
            Already published — use Save Changes for text, price, and storefront
            fields. Images save as soon as you upload or set primary.
          </p>
        ) : null}
      </div>
    </div>
  );
}
