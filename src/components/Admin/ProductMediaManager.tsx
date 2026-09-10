"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import type { AdminProductDetail, AdminProductMedia } from "@/types/admin-catalog";
import {
  deleteAdminProductMedia,
  reorderAdminProductMedia,
  replaceAdminProductMedia,
  updateAdminProductMedia,
  uploadAdminProductMedia,
} from "@/lib/admin-catalog";

type ProductMediaManagerProps = {
  productId: string;
  media: AdminProductMedia[];
  onChange: (product: AdminProductDetail) => void;
};

export default function ProductMediaManager({
  productId,
  media,
  onChange,
}: ProductMediaManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);

  const withBusy = async (fn: () => Promise<AdminProductDetail>) => {
    setBusy(true);
    try {
      const product = await fn();
      onChange(product);
      return product;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Media update failed",
      );
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      let latest: AdminProductDetail | null = null;
      for (const file of Array.from(files)) {
        latest = await withBusy(() =>
          uploadAdminProductMedia(productId, file),
        );
      }
      if (latest) toast.success("Image uploaded");
    } catch {
      // toast already shown
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleReplace = async (files: FileList | null) => {
    const mediaId = replaceTargetId;
    const file = files?.[0];
    setReplaceTargetId(null);
    if (!mediaId || !file) return;

    try {
      await withBusy(() => replaceAdminProductMedia(productId, mediaId, file));
      toast.success("Image replaced");
    } catch {
      // toast already shown
    }
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  const setPrimary = async (mediaId: string) => {
    try {
      await withBusy(() =>
        updateAdminProductMedia(productId, mediaId, { isPrimary: true }),
      );
      toast.success("Primary image updated");
    } catch {
      // toast already shown
    }
  };

  const remove = async (mediaId: string) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      await withBusy(() => deleteAdminProductMedia(productId, mediaId));
      toast.success("Image removed");
    } catch {
      // toast already shown
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sorted.length) return;
    const ids = sorted.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(nextIndex, 0, moved);
    try {
      await withBusy(() => reorderAdminProductMedia(productId, ids));
    } catch {
      // toast already shown
    }
  };

  return (
    <section className="border border-brand-ink/10 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
            Media
          </h2>
          <p className="mt-1 text-xs text-brand-ink/50">
            Saves immediately — no need to press Save Changes.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleReplace(e.target.files)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="bg-brand-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-rust disabled:opacity-60"
          >
            Upload images
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-brand-ink/55">
          No images yet. Upload product photos here.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 border border-brand-ink/10 p-3 sm:flex-row sm:items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText || "Product media"}
                className="h-20 w-20 shrink-0 object-cover bg-brand-cream"
              />
              <div className="min-w-0 flex-1">
                {item.isPrimary ? (
                  <span className="inline-block bg-brand-gold/25 px-2 py-0.5 text-xs font-medium text-brand-ink">
                    Primary
                  </span>
                ) : (
                  <span className="text-xs text-brand-ink/45">Secondary</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void move(index, -1)}
                  className="border border-brand-ink/15 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={busy || index === sorted.length - 1}
                  onClick={() => void move(index, 1)}
                  className="border border-brand-ink/15 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                {!item.isPrimary ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setPrimary(item.id)}
                    className="border border-brand-ink/15 px-2 py-1 text-xs"
                  >
                    Set primary
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReplaceTargetId(item.id);
                    replaceInputRef.current?.click();
                  }}
                  className="border border-brand-ink/15 px-2 py-1 text-xs"
                >
                  Replace
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(item.id)}
                  className="border border-brand-rust/30 px-2 py-1 text-xs text-brand-rust"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
