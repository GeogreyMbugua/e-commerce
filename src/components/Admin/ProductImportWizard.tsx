"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  commitProductImport,
  downloadProductImportTemplate,
  listAdminCategories,
  parseProductImportFile,
  previewProductImportRows,
  publishImportedProducts,
} from "@/lib/admin-catalog";
import { adminProductEditPath, adminProductsPath } from "@/lib/routes";
import type {
  AdminCategoryDetail,
  AdminConditionGrade,
  AdminProductDetail,
  ProductImportCommitRow,
  ProductImportRowInput,
  ProductImportRowPreview,
} from "@/types/admin-catalog";
import { CONDITION_GRADE_LABELS } from "@/types/admin-catalog";

type Step = "upload" | "preview" | "done";

const conditionOptions = Object.keys(
  CONDITION_GRADE_LABELS,
) as AdminConditionGrade[];

const moneyFromMinor = (minor: number | null) =>
  minor === null ? "" : (minor / 100).toFixed(2);

export default function ProductImportWizard() {
  const [step, setStep] = useState<Step>("upload");
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rows, setRows] = useState<ProductImportRowPreview[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    ok: 0,
    warning: 0,
    error: 0,
  });
  const [categories, setCategories] = useState<AdminCategoryDetail[]>([]);
  const [created, setCreated] = useState<AdminProductDetail[]>([]);
  const [commitFailed, setCommitFailed] = useState<
    Array<{ index: number; title: string; message: string }>
  >([]);
  const [publishFailed, setPublishFailed] = useState<
    Array<{ productId: string; message: string }>
  >([]);

  const importableRows = useMemo(
    () => rows.filter((row) => row.severity !== "error"),
    [rows],
  );

  const ensureCategories = async () => {
    if (categories.length > 0) return categories;
    const data = await listAdminCategories();
    setCategories(data);
    return data;
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadProductImportTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "audiovintage-product-import-template.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to download template",
      );
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setParsing(true);
    try {
      await ensureCategories();
      const result = await parseProductImportFile(file);
      setRows(result.rows);
      setSummary(result.summary);
      setStep("preview");
      toast.success(`Parsed ${result.summary.total} rows`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to parse file",
      );
    } finally {
      setParsing(false);
    }
  };

  const updateRawField = (
    index: number,
    patch: Partial<ProductImportRowInput>,
  ) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              raw: { ...row.raw, ...patch },
            }
          : row,
      ),
    );
  };

  const revalidateRows = async () => {
    setParsing(true);
    try {
      const result = await previewProductImportRows(rows.map((row) => row.raw));
      setRows(result.rows);
      setSummary(result.summary);
      toast.success("Preview refreshed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to refresh preview",
      );
    } finally {
      setParsing(false);
    }
  };

  const handleCommit = async () => {
    const ready = importableRows
      .map((row) => row.normalized)
      .filter(
        (
          normalized,
        ): normalized is ProductImportRowPreview["normalized"] & {
          categoryId: string;
          priceMinor: number;
          conditionGrade: AdminConditionGrade;
        } =>
          Boolean(
            normalized.categoryId &&
              normalized.priceMinor !== null &&
              normalized.conditionGrade,
          ),
      );

    if (ready.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    const payload: ProductImportCommitRow[] = ready.map((row) => ({
      title: row.title,
      description: row.description,
      categoryId: row.categoryId,
      priceMinor: row.priceMinor,
      conditionGrade: row.conditionGrade,
      brand: row.brand,
      model: row.model,
      shortDescription: row.shortDescription,
      compareAtMinor: row.compareAtMinor,
      quantityAvailable: row.quantityAvailable,
      isUniqueItem: row.isUniqueItem,
      tags: row.tags,
      conditionNotes: row.conditionNotes,
      defects: row.defects,
      testingNotes: row.testingNotes,
      imageUrl: row.imageUrl,
      sku: row.sku,
    }));

    setCommitting(true);
    try {
      const result = await commitProductImport(payload);
      setCreated(result.created);
      setCommitFailed(result.failed);
      setStep("done");
      toast.success(
        `Created ${result.created.length} draft${result.created.length === 1 ? "" : "s"}`,
      );
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} row(s) failed to import`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to import products",
      );
    } finally {
      setCommitting(false);
    }
  };

  const handlePublishAll = async () => {
    if (created.length === 0) return;
    setPublishing(true);
    try {
      const result = await publishImportedProducts(created.map((p) => p.id));
      setCreated(result.published);
      setPublishFailed(result.failed);
      toast.success(
        `Published ${result.published.length} product${result.published.length === 1 ? "" : "s"}`,
      );
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} could not be published`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to publish products",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-ink/10 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          Import products from CSV / Excel
        </h2>
        <p className="mt-2 text-sm text-brand-ink/65">
          Upload a spreadsheet, fix any row issues in the preview, then create
          drafts. Add photos in each product if needed, then publish.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-brand-ink/55">
          <li>
            Required columns: title, description, category (slug or name),
            price, conditionGrade
          </li>
          <li>
            Optional: brand, model, shortDescription, compareAtPrice, quantity,
            isUniqueItem, tags, notes, imageUrl, sku
          </li>
          <li>Imports create drafts only — nothing goes live until you publish</li>
        </ul>
      </div>

      {step === "upload" ? (
        <div className="rounded-lg border border-dashed border-brand-ink/20 bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleDownloadTemplate()}
              className="rounded-md border border-brand-ink/15 px-3 py-2 text-sm font-medium hover:bg-brand-cream"
            >
              Download CSV template
            </button>
            <label className="cursor-pointer rounded-md bg-brand-ink px-3 py-2 text-sm font-medium text-white hover:bg-brand-rust">
              {parsing ? "Parsing…" : "Choose CSV or Excel file"}
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                disabled={parsing}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = "";
                  void handleFile(file);
                }}
              />
            </label>
          </div>
        </div>
      ) : null}

      {step === "preview" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand-ink/70">
              {summary.total} rows · {summary.ok} ok · {summary.warning}{" "}
              warnings · {summary.error} errors
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("upload");
                  setRows([]);
                }}
                className="rounded-md border border-brand-ink/15 px-3 py-2 text-sm"
              >
                Choose another file
              </button>
              <button
                type="button"
                disabled={parsing}
                onClick={() => void revalidateRows()}
                className="rounded-md border border-brand-ink/15 px-3 py-2 text-sm disabled:opacity-60"
              >
                {parsing ? "Checking…" : "Re-check rows"}
              </button>
              <button
                type="button"
                disabled={committing || importableRows.length === 0}
                onClick={() => void handleCommit()}
                className="rounded-md bg-brand-ink px-3 py-2 text-sm font-medium text-white hover:bg-brand-rust disabled:opacity-60"
              >
                {committing
                  ? "Importing…"
                  : `Import ${importableRows.length} as drafts`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-brand-ink/10 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-brand-ink/10 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Condition</th>
                  <th className="px-3 py-2">Issues</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.rowNumber}-${index}`}
                    className="border-b border-brand-ink/5 align-top last:border-0"
                  >
                    <td className="px-3 py-2 text-brand-ink/50">
                      {row.rowNumber}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          row.severity === "ok"
                            ? "bg-brand-teal/15 text-brand-teal"
                            : row.severity === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.raw.title ?? ""}
                        onChange={(e) =>
                          updateRawField(index, { title: e.target.value })
                        }
                        className="w-44 rounded border border-brand-ink/15 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.raw.category ?? ""}
                        onChange={(e) =>
                          updateRawField(index, { category: e.target.value })
                        }
                        list="import-category-options"
                        className="w-40 rounded border border-brand-ink/15 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={
                          row.raw.price === null || row.raw.price === undefined
                            ? moneyFromMinor(row.normalized.priceMinor)
                            : String(row.raw.price)
                        }
                        onChange={(e) =>
                          updateRawField(index, { price: e.target.value })
                        }
                        className="w-24 rounded border border-brand-ink/15 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.raw.conditionGrade ?? ""}
                        onChange={(e) =>
                          updateRawField(index, {
                            conditionGrade: e.target.value,
                          })
                        }
                        className="rounded border border-brand-ink/15 px-2 py-1 text-sm"
                      >
                        <option value="">Select…</option>
                        {conditionOptions.map((grade) => (
                          <option key={grade} value={grade}>
                            {CONDITION_GRADE_LABELS[grade]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-xs text-brand-ink/60">
                      {[...row.errors, ...row.warnings].join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <datalist id="import-category-options">
            {categories
              .filter((category) => category.isActive)
              .map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
          </datalist>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-4 rounded-lg border border-brand-ink/10 bg-white p-4 sm:p-5">
          <h3 className="font-medium text-brand-ink">Import complete</h3>
          <p className="text-sm text-brand-ink/65">
            Created {created.length} draft
            {created.length === 1 ? "" : "s"}
            {commitFailed.length > 0
              ? ` · ${commitFailed.length} failed`
              : ""}
            .
          </p>

          {created.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {created.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-ink/5 py-2 last:border-0"
                >
                  <span>
                    {product.title}{" "}
                    <span className="text-xs text-brand-ink/45">
                      ({product.status})
                    </span>
                  </span>
                  <Link
                    href={adminProductEditPath(product.id)}
                    className="text-xs font-medium text-brand-rust hover:underline"
                  >
                    Edit / add photos
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {commitFailed.length > 0 ? (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              {commitFailed.map((item) => (
                <p key={`${item.index}-${item.title}`}>
                  {item.title}: {item.message}
                </p>
              ))}
            </div>
          ) : null}

          {publishFailed.length > 0 ? (
            <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              {publishFailed.map((item) => (
                <p key={item.productId}>
                  {item.productId}: {item.message}
                </p>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={publishing || created.length === 0}
              onClick={() => void handlePublishAll()}
              className="rounded-md bg-brand-ink px-3 py-2 text-sm font-medium text-white hover:bg-brand-rust disabled:opacity-60"
            >
              {publishing ? "Publishing…" : "Publish all ready drafts"}
            </button>
            <Link
              href={adminProductsPath}
              className="rounded-md border border-brand-ink/15 px-3 py-2 text-sm"
            >
              Back to products
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep("upload");
                setRows([]);
                setCreated([]);
                setCommitFailed([]);
                setPublishFailed([]);
              }}
              className="rounded-md border border-brand-ink/15 px-3 py-2 text-sm"
            >
              Import another file
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
