import Image from "@/components/Common/BrandedImage";
import { PortableText } from "next-sanity";
import Link from "next/link";
import type { ReactNode } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import {
  SanityArticle,
  SanityImageSource,
  urlFor,
} from "@/lib/sanity";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="mb-6">{children}</p>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="mb-5 mt-10 text-xl font-medium text-dark lg:text-2xl">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="mb-4 mt-8 text-lg font-medium text-dark">{children}</h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="my-8 border-l-4 border-brand-rust bg-white px-5 py-4 italic text-dark">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6">{children}</ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6">{children}</ol>
    ),
  },
  types: {
    image: ({ value }: { value: unknown }) => (
      <figure className="my-8 overflow-hidden rounded-xl">
        <Image
          src={urlFor(value as SanityImageSource).width(1200).auto("format").url()}
          alt=""
          width={1200}
          height={675}
          className="h-auto w-full"
        />
      </figure>
    ),
  },
};

const ArticleDetails = ({ article }: { article: SanityArticle }) => {
  const author = article.authors?.[0];

  return (
    <>
      <Breadcrumb
        title={article.title}
        pages={["listening room", article.slug]}
      />

      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="mx-auto w-full max-w-[750px] px-4 sm:px-8 xl:px-0">
          <div className="mb-7.5 overflow-hidden rounded-[10px]">
            <Image
              className="h-auto w-full rounded-[10px]"
              src={urlFor(article.heroImage).width(1500).auto("format").url()}
              alt={article.title}
              width={1500}
              height={844}
              priority
            />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-custom-sm text-brand-ink/70">
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              {article.categories?.[0] && (
                <>
                  <span className="block h-4 w-px bg-gray-4" />
                  <span>{article.categories[0].title}</span>
                </>
              )}
            </div>

            <h1 className="mb-4 text-xl font-medium text-dark lg:text-2xl xl:text-custom-4xl">
              {article.title}
            </h1>

            <p className="mb-8 text-lg leading-8 text-brand-ink/75">
              {article.excerpt}
            </p>

            <div className="prose max-w-none text-brand-ink/85">
              <PortableText
                value={article.body as never}
                components={portableTextComponents}
              />
            </div>

            {(author || article.tags?.length) && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-8 border-t border-brand-ink/10 pt-6">
                {author && (
                  <div className="flex items-center gap-3">
                    {author.image ? (
                      <Image
                        src={urlFor(author.image).width(96).height(96).url()}
                        alt={author.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-rust text-sm font-medium text-white">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-custom-sm text-dark">{author.name}</p>
                      {author.role && (
                        <p className="text-custom-xs text-brand-ink/60">
                          {author.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {article.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        className="rounded-md border border-brand-ink/10 bg-white px-3 py-1 text-custom-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <Link
              href="/blogs/blog-grid"
              className="mt-8 inline-flex items-center gap-2 text-custom-sm text-brand-rust hover:text-brand-ink"
            >
              Back to the Listening Room
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArticleDetails;
