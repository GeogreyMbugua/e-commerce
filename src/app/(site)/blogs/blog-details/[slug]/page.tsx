import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetails from "@/components/BlogDetails/ArticleDetails";
import { getArticleBySlug, getArticleSlugs } from "@/lib/sanity";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
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

  return {
    title: `${article.seo?.metaTitle || article.title} | AudioVintage`,
    description: article.seo?.metaDescription || article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main>
      <ArticleDetails article={article} />
    </main>
  );
}
