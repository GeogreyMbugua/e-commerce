"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "@/components/Common/BrandedImage";
import type { AdminCategoryDetail } from "@/types/admin-catalog";
import {
  activateAdminCategory,
  createAdminCategory,
  deactivateAdminCategory,
  deleteAdminCategoryImage,
  listAdminCategories,
  updateAdminCategory,
  uploadAdminCategoryImage,
} from "@/lib/admin-catalog";
import { getCategoryInitial } from "@/lib/category-display";

type EditDraft = {
  name: string;
  slug: string;
  description: string;
};

const emptyDraft = (): EditDraft => ({
  name: "",
  slug: "",
  description: "",
});

type CategoryImageCellProps = {
  category: AdminCategoryDetail;
  busy: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
  onPickFile: () => void;
};

function CategoryImageCell({
  category,
  busy,
  inputRef,
  onUpload,
  onRemove,
  onPickFile,
}: CategoryImageCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-brand-ink/10 bg-brand-cream">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-ink/40">
            {getCategoryInitial(category.name)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            onUpload(file);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={onPickFile}
          className="rounded-md border border-brand-ink/15 px-2 py-0.5 text-left text-xs font-medium hover:bg-brand-cream disabled:opacity-60"
        >
          {busy ? "Saving…" : category.imageUrl ? "Replace image" : "Add image"}
        </button>
        {category.imageUrl ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="text-left text-xs text-brand-ink/50 hover:text-brand-rust disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

type CategoryEditFormProps = {
  draft: EditDraft;
  saving: boolean;
  compact?: boolean;
  onChange: (draft: EditDraft) => void;
  onSave: (event: React.FormEvent) => void;
  onCancel: () => void;
};

function CategoryEditForm({
  draft,
  saving,
  compact = false,
  onChange,
  onSave,
  onCancel,
}: CategoryEditFormProps) {
  return (
    <form
      onSubmit={onSave}
      className={
        compact
          ? "mt-3 space-y-3 rounded-md border border-brand-ink/10 bg-brand-cream/40 p-3"
          : "space-y-3"
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-ink/70">
            Name
          </label>
          <input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-ink/70">
            Slug
          </label>
          <input
            value={draft.slug}
            onChange={(e) => onChange({ ...draft, slug: e.target.value })}
            className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
            required
          />
          <p className="mt-1 text-[11px] text-brand-ink/45">
            Changing the slug updates shop filter links for this category.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-brand-ink/70">
            Description
          </label>
          <textarea
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
            rows={2}
            className="w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-rust disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-md border border-brand-ink/15 px-3 py-1.5 text-xs font-medium hover:bg-white disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<AdminCategoryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft);
  const [savingEdit, setSavingEdit] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminCategories();
      setCategories(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (category: AdminCategoryDetail) => {
    setEditingId(category.id);
    setEditDraft({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(emptyDraft());
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createAdminCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
        isActive: true,
      });
      toast.success("Category created");
      setName("");
      setSlug("");
      setDescription("");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;

    if (!editDraft.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editDraft.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSavingEdit(true);
    try {
      await updateAdminCategory(editingId, {
        name: editDraft.name.trim(),
        slug: editDraft.slug.trim(),
        description: editDraft.description.trim() || null,
      });
      toast.success("Category updated");
      cancelEdit();
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update category",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleActive = async (category: AdminCategoryDetail) => {
    try {
      if (category.isActive) {
        await deactivateAdminCategory(category.id);
        toast.success("Category deactivated");
      } else {
        await activateAdminCategory(category.id);
        toast.success("Category activated");
      }
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update category",
      );
    }
  };

  const handleImageUpload = async (categoryId: string, file: File | null) => {
    if (!file) return;
    setUploadingId(categoryId);
    try {
      await uploadAdminCategoryImage(categoryId, file);
      toast.success("Category image updated");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleImageRemove = async (category: AdminCategoryDetail) => {
    if (!category.imageUrl) return;
    setUploadingId(category.id);
    try {
      await deleteAdminCategoryImage(category.id);
      toast.success("Category image removed");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove image",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const renderImageCell = (category: AdminCategoryDetail) => (
    <CategoryImageCell
      category={category}
      busy={uploadingId === category.id}
      inputRef={(el) => {
        fileInputs.current[category.id] = el;
      }}
      onUpload={(file) => void handleImageUpload(category.id, file)}
      onRemove={() => void handleImageRemove(category)}
      onPickFile={() => fileInputs.current[category.id]?.click()}
    />
  );

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void handleCreate(e)}
        className="rounded-lg border border-brand-ink/10 bg-white p-4 sm:p-5"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-ink/60">
          New category
        </h2>
        <p className="mb-3 text-xs text-brand-ink/55">
          After creating a category, add a storefront image and edit details
          from the list below.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink/70">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-brand-ink/15 px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink/70">
              Slug (optional)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if empty"
              className="w-full rounded-md border border-brand-ink/15 px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-brand-ink/70">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-brand-ink/15 px-3 py-2 text-sm outline-none focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-rust disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create category"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-brand-ink/60">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-brand-ink/20 bg-white p-6 text-sm text-brand-ink/70">
          No categories yet.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-brand-ink/10 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-brand-ink/10 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Products</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const isEditing = editingId === category.id;

                  return (
                    <tr
                      key={category.id}
                      className="border-b border-brand-ink/5 last:border-0"
                    >
                      <td className="px-4 py-3 align-top">
                        {renderImageCell(category)}
                      </td>
                      <td
                        className="px-4 py-3 align-top"
                        colSpan={isEditing ? 4 : 1}
                      >
                        {isEditing ? (
                          <CategoryEditForm
                            draft={editDraft}
                            saving={savingEdit}
                            onChange={setEditDraft}
                            onSave={(e) => void handleSaveEdit(e)}
                            onCancel={cancelEdit}
                          />
                        ) : (
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description ? (
                              <p className="mt-0.5 line-clamp-2 text-xs text-brand-ink/50">
                                {category.description}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </td>
                      {!isEditing ? (
                        <>
                          <td className="px-4 py-3 align-top text-brand-ink/60">
                            {category.slug}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {category.productCount}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                category.isActive
                                  ? "bg-brand-teal/15 text-brand-teal"
                                  : "bg-gray-3 text-gray-6"
                              }`}
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                onClick={() => startEdit(category)}
                                className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium hover:bg-brand-cream"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void toggleActive(category)}
                                className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium hover:bg-brand-cream"
                              >
                                {category.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3 align-top">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium hover:bg-brand-cream"
                          >
                            Close
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {categories.map((category) => {
              const isEditing = editingId === category.id;

              return (
                <article
                  key={category.id}
                  className="rounded-lg border border-brand-ink/10 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    {renderImageCell(category)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-brand-ink/50">
                            {category.slug}
                          </p>
                          {category.description ? (
                            <p className="mt-1 text-xs text-brand-ink/55">
                              {category.description}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            category.isActive
                              ? "bg-brand-teal/15 text-brand-teal"
                              : "bg-gray-3 text-gray-6"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-brand-ink/60">
                        {category.productCount} products
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            isEditing ? cancelEdit() : startEdit(category)
                          }
                          className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(category)}
                          className="rounded-md border border-brand-ink/15 px-2.5 py-1 text-xs font-medium"
                        >
                          {category.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                      {isEditing ? (
                        <CategoryEditForm
                          draft={editDraft}
                          saving={savingEdit}
                          compact
                          onChange={setEditDraft}
                          onSave={(e) => void handleSaveEdit(e)}
                          onCancel={cancelEdit}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
