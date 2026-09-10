"use client";

import { useMemo, useState } from "react";
import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import BlogItem from "@/components/Blog/BlogItem";
import type { BlogItem as BlogItemType } from "@/types/blogItem";

export type ListeningRoomCategory = {
  title: string;
  slug: string;
  description?: string;
  count: number;
};

export type ListeningRoomArticleCard = BlogItemType & {
  categorySlug?: string;
};

type ListeningRoomViewProps = {
  featured: ListeningRoomArticleCard | null;
  articles: ListeningRoomArticleCard[];
  categories: ListeningRoomCategory[];
};

const formatLabel = (value: string) => value;

export default function ListeningRoomView({
  featured,
  articles,
  categories,
}: ListeningRoomViewProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) {
      return articles;
    }
    return articles.filter((article) => article.categorySlug === activeCategory);
  }, [activeCategory, articles]);

  const showFeatured =
    featured &&
    (!activeCategory || featured.categorySlug === activeCategory);

  const rest = useMemo(() => {
    if (!showFeatured || !featured?.slug) {
      return filtered;
    }
    return filtered.filter((article) => article.slug !== featured.slug);
  }, [filtered, featured, showFeatured]);

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 10% 0%, rgba(184,95,45,0.12), transparent 55%), radial-gradient(ellipse 50% 35% at 100% 20%, rgba(45,90,90,0.08), transparent 50%)",
        }}
      />

      <section className="relative border-b border-brand-ink/10 bg-[#f3efe6]/55">
        <div className="mx-auto w-full max-w-[1170px] px-4 py-12 sm:px-8 sm:py-16 xl:px-0">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust">
            Editorial
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
            Listening Room
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-ink/65 sm:text-lg">
            Stories, guides, and notes from the AudioVintage bench — written for
            people who care how gear sounds in a real room.
          </p>

          {categories.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-brand-ink text-white"
                    : "border border-brand-ink/15 bg-white/70 text-brand-ink/70 hover:border-brand-rust/40"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategory(category.slug)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === category.slug
                      ? "bg-brand-ink text-white"
                      : "border border-brand-ink/15 bg-white/70 text-brand-ink/70 hover:border-brand-rust/40"
                  }`}
                  title={category.description}
                >
                  {formatLabel(category.title)}
                  <span className="ml-1.5 opacity-60">{category.count}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          {!featured && filtered.length === 0 ? (
            <div className="border border-dashed border-brand-ink/20 bg-white/60 px-6 py-16 text-center">
              <p className="text-lg font-medium text-brand-ink">
                No published stories yet
              </p>
              <p className="mt-2 text-sm text-brand-ink/60">
                Publish an article in Sanity Studio, then rebuild the storefront.
              </p>
            </div>
          ) : null}

          {showFeatured && featured ? (
            <article className="group mb-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
              <Link
                href={`/blogs/blog-details/${featured.slug}`}
                className="relative block aspect-[16/10] overflow-hidden bg-brand-ink/5 lg:col-span-7 lg:aspect-auto lg:min-h-[420px]"
              >
                <Image
                  src={featured.img}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </Link>

              <div className="flex flex-col justify-center lg:col-span-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-rust">
                  {rest.length === 0 && !activeCategory
                    ? "Featured story"
                    : "Latest"}
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-ink/50">
                  {featured.category ? (
                    <span className="text-brand-rust">{featured.category}</span>
                  ) : null}
                  {featured.category ? <span aria-hidden>•</span> : null}
                  <time>{featured.date}</time>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
                  <Link
                    href={`/blogs/blog-details/${featured.slug}`}
                    className="transition-colors hover:text-brand-rust"
                  >
                    {featured.title}
                  </Link>
                </h2>
                {featured.excerpt ? (
                  <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                    {featured.excerpt}
                  </p>
                ) : null}
                <Link
                  href={`/blogs/blog-details/${featured.slug}`}
                  className="mt-6 inline-flex w-fit items-center gap-2 bg-brand-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-rust"
                >
                  Read the story
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ) : null}

          {rest.length > 0 ? (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-brand-ink/10 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-ink/55">
                  {activeCategory ? "In this category" : "More from the room"}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <BlogItem blog={article} key={article.slug ?? article.title} />
                ))}
              </div>
            </>
          ) : null}

          {showFeatured && rest.length === 0 && !activeCategory ? (
            <p className="mt-2 text-sm text-brand-ink/50">
              More Listening Room stories will appear here as they are
              published.
            </p>
          ) : null}

          {activeCategory && !showFeatured && rest.length === 0 ? (
            <p className="text-sm text-brand-ink/60">
              No published stories in this category yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
