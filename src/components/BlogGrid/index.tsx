import React from "react";
import ListeningRoomView, {
  type ListeningRoomArticleCard,
} from "./ListeningRoomView";
import {
  getArticleCategories,
  getArticles,
  urlFor,
} from "@/lib/sanity";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const BlogGrid = async () => {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getArticleCategories(),
  ]);

  const cards: ListeningRoomArticleCard[] = articles.map((article) => {
    const primary = article.categories?.[0];
    return {
      date: formatDate(article.publishedAt),
      title: article.title,
      img: urlFor(article.heroImage).width(1400).height(900).auto("format").url(),
      slug: article.slug,
      excerpt: article.excerpt,
      category: primary?.title,
      categorySlug: primary?.slug,
    };
  });

  const categoryCounts = new Map<string, number>();
  for (const card of cards) {
    if (!card.categorySlug) continue;
    categoryCounts.set(
      card.categorySlug,
      (categoryCounts.get(card.categorySlug) ?? 0) + 1,
    );
  }

  const roomCategories = categories.map((category) => ({
    title: category.title,
    slug: category.slug,
    description: category.description,
    count: categoryCounts.get(category.slug) ?? 0,
  }));

  const featured = cards[0] ?? null;

  return (
    <ListeningRoomView
      featured={featured}
      articles={cards}
      categories={roomCategories}
    />
  );
};

export default BlogGrid;
