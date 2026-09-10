import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { createClient } from "next-sanity";

export type { SanityImageSource };

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fm80bgv3";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * Published Content Lake client.
 * useCdn: true serves published documents only (drafts stay out of the static storefront).
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published",
});

const imageBuilder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => imageBuilder.image(source);

/** Hard gate for every public article query / route / feed. */
export const PUBLIC_ARTICLE = `_type == "article" && visibility == "public" && defined(slug.current) && defined(publishedAt) && defined(heroImage)`;

export type SanityArticleAuthor = {
  _id?: string;
  name: string;
  role?: string;
  bio?: string;
  image?: SanityImageSource;
};

export type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  heroImage: SanityImageSource;
  body: unknown[];
  authors: SanityArticleAuthor[];
  categories: Array<{
    _id?: string;
    title: string;
    slug?: string;
  }>;
  tags?: string[];
  publishedAt: string;
  _updatedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
};

export type SanityArticleCategory = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
};

const articleProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  _updatedAt,
  tags,
  heroImage,
  body[]{
    ...,
    _type == "image" => {
      ...,
      "lqip": asset->metadata.lqip,
      "dimensions": asset->metadata.dimensions,
      asset->
    }
  },
  authors[]->{ _id, name, role, bio, image },
  categories[]->{ _id, title, "slug": slug.current },
  seo
}`;

export const articlesQuery = `*[
  ${PUBLIC_ARTICLE}
] | order(publishedAt desc) ${articleProjection}`;

export const articleBySlugQuery = `*[
  ${PUBLIC_ARTICLE} &&
  slug.current == $slug
][0]${articleProjection}`;

export const articleSlugsQuery = `*[
  ${PUBLIC_ARTICLE}
]{"slug": slug.current}`;

export async function getArticles() {
  return sanityClient.fetch<SanityArticle[]>(articlesQuery);
}

export async function getArticleCategories() {
  return sanityClient.fetch<SanityArticleCategory[]>(
    `*[
      _type == "articleCategory" &&
      defined(slug.current)
    ] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      description
    }`,
  );
}

export async function getArticleBySlug(slug: string) {
  return sanityClient.fetch<SanityArticle | null>(articleBySlugQuery, { slug });
}

export async function getArticleSlugs() {
  return sanityClient.fetch<Array<{ slug: string }>>(articleSlugsQuery);
}

export function resolveArticleSeo(article: SanityArticle) {
  return {
    title: article.seo?.metaTitle?.trim() || article.title,
    description: article.seo?.metaDescription?.trim() || article.excerpt,
  };
}
