import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { createClient } from "next-sanity";

export type { SanityImageSource };

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "lfv6li8u";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: false,
});

const imageBuilder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => imageBuilder.image(source);

export type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  heroImage: SanityImageSource;
  body: unknown[];
  authors: Array<{
    name: string;
    role?: string;
    image?: SanityImageSource;
  }>;
  categories: Array<{
    title: string;
    slug?: string;
  }>;
  tags?: string[];
  publishedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
};

const articleProjection = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  heroImage,
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->
    }
  },
  authors[]->{name, role, image},
  categories[]->{title, "slug": slug.current},
  tags,
  publishedAt,
  seo
}`;

export const articlesQuery = `*[
  _type == "article" &&
  visibility == "public" &&
  defined(slug.current) &&
  defined(heroImage)
] | order(publishedAt desc) ${articleProjection}`;

export async function getArticles() {
  return sanityClient.fetch<SanityArticle[]>(articlesQuery);
}

export async function getArticleBySlug(slug: string) {
  return sanityClient.fetch<SanityArticle | null>(
    `*[
      _type == "article" &&
      visibility == "public" &&
      slug.current == $slug
    ][0]${articleProjection}`,
    {slug}
  );
}

export async function getArticleSlugs() {
  return sanityClient.fetch<Array<{slug: string}>>(
    `*[
      _type == "article" &&
      visibility == "public" &&
      defined(slug.current)
    ]{"slug": slug.current}`
  );
}
