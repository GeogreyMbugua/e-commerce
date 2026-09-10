"use client";

import React from "react";
import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import type { BlogItem } from "@/types/blogItem";

const BlogItemCard = ({ blog }: { blog: BlogItem }) => {
  const articleHref = blog.slug
    ? `/blogs/blog-details/${blog.slug}`
    : "/blogs/blog-grid";

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={articleHref}
        className="relative block aspect-[3/2] overflow-hidden bg-brand-ink/5"
      >
        <Image
          src={blog.img}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-ink/50">
          {blog.category ? (
            <span className="text-brand-rust">{blog.category}</span>
          ) : null}
          {blog.category ? <span aria-hidden>•</span> : null}
          <time>{blog.date}</time>
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-brand-ink transition-colors group-hover:text-brand-rust sm:text-xl">
          <Link href={articleHref}>{blog.title}</Link>
        </h2>

        {blog.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-ink/65">
            {blog.excerpt}
          </p>
        ) : null}

        <Link
          href={articleHref}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-rust transition-colors hover:text-brand-ink"
        >
          Read story
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </article>
  );
};

export default BlogItemCard;
