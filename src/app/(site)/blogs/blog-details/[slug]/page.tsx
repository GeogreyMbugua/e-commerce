import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetails from "@/components/BlogDetails/ArticleDetails";
import {
  getArticleBySlug,
  getArticleSlugs,
  resolveArticleSeo,
  urlFor,
} from "@/lib/sanity";
import { basePath } from "@/lib/routes";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://geogreymbugua.github.io";

const absoluteUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin}${basePath}${normalized}`;
};

export async function generateStaticParams() {
  return getArticleSlugs();
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | AudioVintage",
    };
  }

  const seo = resolveArticleSeo(article);
  const canonical = absoluteUrl(`/blogs/blog-details/${article.slug}`);
  const ogImage = urlFor(article.heroImage)
    .width(1200)
    .height(630)
    .fit("crop")
    .auto("format")
    .url();

  return {
    title: `${seo.title} | AudioVintage`,
    description: seo.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      title: seo.title,
      description: seo.description,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
      authors: article.authors?.map((author) => author.name).filter(Boolean),
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

function ArticleJsonLd({
  article,
  canonical,
}: {
  article: NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>;
  canonical: string;
}) {
  const seo = resolveArticleSeo(article);
  const image = urlFor(article.heroImage)
    .width(1200)
    .height(630)
    .fit("crop")
    .auto("format")
    .url();

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seo.title,
    description: seo.description,
    image: [image],
    datePublished: article.publishedAt,
    dateModified: article._updatedAt || article.publishedAt,
    mainEntityOfPage: canonical,
    author: (article.authors ?? []).map((author) => ({
      "@type": "Person",
      name: author.name,
      ...(author.role ? { jobTitle: author.role } : {}),
    })),
    publisher: {
      "@type": "Organization",
      name: "AudioVintage",
      url: `${siteOrigin}${basePath || "/"}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const canonical = absoluteUrl(`/blogs/blog-details/${article.slug}`);

  return (
    <main>
      <ArticleJsonLd article={article} canonical={canonical} />
      <ArticleDetails article={article} />
    </main>
  );
}
