import { authFetch, getAccessToken } from "@/lib/auth";
import type {
  AdminCategoryDetail,
  AdminProductDetail,
  CreateAdminCategoryInput,
  CreateAdminProductInput,
  ListAdminProductsQuery,
  PaginatedAdminProducts,
  UpdateAdminCategoryInput,
  UpdateAdminMediaInput,
  UpdateAdminProductInput,
} from "@/types/admin-catalog";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildQuery = (params: ListAdminProductsQuery) => {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.category) search.set("category", params.category);
  if (params.status) search.set("status", params.status);
  if (params.availability) search.set("availability", params.availability);
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export async function listAdminProducts(
  params: ListAdminProductsQuery = {},
): Promise<PaginatedAdminProducts> {
  return authFetch<PaginatedAdminProducts>(
    `/admin/products${buildQuery(params)}`,
  );
}

export async function getAdminProduct(
  id: string,
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}`,
  );
}

export async function createAdminProduct(
  input: CreateAdminProductInput,
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>("/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateAdminProduct(
  id: string,
  input: UpdateAdminProductInput,
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

async function postProductAction(
  id: string,
  action: "publish" | "unpublish" | "unavailable" | "sold" | "archive",
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}/${action}`,
    { method: "POST" },
  );
}

export const publishAdminProduct = (id: string) =>
  postProductAction(id, "publish");
export const unpublishAdminProduct = (id: string) =>
  postProductAction(id, "unpublish");
export const markAdminProductUnavailable = (id: string) =>
  postProductAction(id, "unavailable");
export const markAdminProductSold = (id: string) =>
  postProductAction(id, "sold");
export const archiveAdminProduct = (id: string) =>
  postProductAction(id, "archive");

export async function addAdminProductMedia(
  id: string,
  input: { url: string; altText?: string | null; isPrimary?: boolean },
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

/**
 * Multipart upload — Authorization only; let the browser set Content-Type
 * with the multipart boundary.
 */
export async function uploadAdminProductMedia(
  id: string,
  file: File,
): Promise<AdminProductDetail> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${apiBaseUrl}/admin/products/${encodeURIComponent(id)}/media/upload`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = errorBody?.message;
    const text = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : null;
    throw new Error(text ?? `Upload failed (${response.status})`);
  }

  return response.json() as Promise<AdminProductDetail>;
}

export async function replaceAdminProductMedia(
  id: string,
  mediaId: string,
  file: File,
): Promise<AdminProductDetail> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${apiBaseUrl}/admin/products/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}/replace`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = errorBody?.message;
    const text = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : null;
    throw new Error(text ?? `Replace failed (${response.status})`);
  }

  return response.json() as Promise<AdminProductDetail>;
}

export async function updateAdminProductMedia(
  id: string,
  mediaId: string,
  input: UpdateAdminMediaInput,
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export async function deleteAdminProductMedia(
  id: string,
  mediaId: string,
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`,
    { method: "DELETE" },
  );
}

export async function reorderAdminProductMedia(
  id: string,
  mediaIds: string[],
): Promise<AdminProductDetail> {
  return authFetch<AdminProductDetail>(
    `/admin/products/${encodeURIComponent(id)}/media/order`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaIds }),
    },
  );
}

export async function listAdminCategories(): Promise<AdminCategoryDetail[]> {
  return authFetch<AdminCategoryDetail[]>("/admin/categories");
}

export async function createAdminCategory(
  input: CreateAdminCategoryInput,
): Promise<AdminCategoryDetail> {
  return authFetch<AdminCategoryDetail>("/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateAdminCategory(
  id: string,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategoryDetail> {
  return authFetch<AdminCategoryDetail>(
    `/admin/categories/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export async function activateAdminCategory(
  id: string,
): Promise<AdminCategoryDetail> {
  return authFetch<AdminCategoryDetail>(
    `/admin/categories/${encodeURIComponent(id)}/activate`,
    { method: "POST" },
  );
}

export async function deactivateAdminCategory(
  id: string,
): Promise<AdminCategoryDetail> {
  return authFetch<AdminCategoryDetail>(
    `/admin/categories/${encodeURIComponent(id)}/deactivate`,
    { method: "POST" },
  );
}

export async function uploadAdminCategoryImage(
  id: string,
  file: File,
): Promise<AdminCategoryDetail> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${apiBaseUrl}/admin/categories/${encodeURIComponent(id)}/image`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = errorBody?.message;
    const text = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : null;
    throw new Error(text ?? `Upload failed (${response.status})`);
  }

  return response.json() as Promise<AdminCategoryDetail>;
}

export async function deleteAdminCategoryImage(
  id: string,
): Promise<AdminCategoryDetail> {
  return authFetch<AdminCategoryDetail>(
    `/admin/categories/${encodeURIComponent(id)}/image`,
    { method: "DELETE" },
  );
}

export const majorToMinor = (major: number) => Math.round(major * 100);
export const minorToMajor = (minor: number) => minor / 100;
