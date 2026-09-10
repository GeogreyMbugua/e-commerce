import Image from "@/components/Common/BrandedImage";
import { PortableText } from "next-sanity";
import Link from "next/link";
import type { ReactNode } from "react";
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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const readingTimeMinutes = (article: SanityArticle) => {
  const text = JSON.stringify(article.body ?? []);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

type BodyImageValue = SanityImageSource & {
  alt?: string;
  caption?: string;
  dimensions?: { width?: number; height?: number };
  lqip?: string;
};

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="mb-6 text-[1.05rem] leading-8 text-brand-ink/85 [max-width:65ch]">
        {children}
      </p>
    ),
    h2: ({ children, value }: { children?: ReactNode; value?: { children?: Array<{ text?: string }> } }) => {
      const text =
        value?.children?.map((child) => child.text ?? "").join("") ||
        (typeof children === "string" ? children : "section");
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="mb-4 mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight text-brand-ink"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-brand-ink/90">
        {children}
      </h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="my-10 border-l-2 border-brand-rust pl-5 text-xl italic leading-9 text-brand-ink/80 [max-width:40rem]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-brand-ink/85 [max-width:65ch]">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-brand-rust text-brand-ink/85 [max-width:65ch]">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children?: ReactNode;
      value?: { href?: string; blank?: boolean };
    }) => {
      const href = value?.href || "#";
      const external = /^https?:\/\//i.test(href);
      const openBlank = value?.blank || external;
      return (
        <a
          href={href}
          className="font-medium text-brand-rust underline underline-offset-2 hover:text-brand-ink"
          {...(openBlank
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    code: ({ children }: { children?: ReactNode }) => (
      <code className="rounded bg-brand-ink/8 px-1.5 py-0.5 font-mono text-[0.9em] text-brand-ink">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }: { value: BodyImageValue }) => {
      const width = value.dimensions?.width || 1200;
      const height = value.dimensions?.height || 675;
      return (
        <figure className="my-10 overflow-hidden">
          <Image
            src={urlFor(value).width(1200).auto("format").url()}
            alt={value.alt || ""}
            width={width}
            height={height}
            className="h-auto w-full"
            placeholder={value.lqip ? "blur" : "empty"}
            blurDataURL={value.lqip}
          />
          {value.caption ? (
            <figcaption className="mt-3 text-sm text-brand-ink/55">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
  unknownType: ({ value }: { value: { _type?: string } }) => {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    return (
      <pre className="my-4 overflow-auto rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
        Unmapped Portable Text type: {value?._type ?? "unknown"}
      </pre>
    );
  },
};

const ArticleDetails = ({ article }: { article: SanityArticle }) => {
  const author = article.authors?.[0];
  const category = article.categories?.[0];
  const minutes = readingTimeMinutes(article);

  return (
    <div className="relative overflow-hidden bg-[#f3efe6]/40">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(184,95,45,0.1), transparent 55%)",
        }}
      />

      <section className="relative pb-8 pt-10 sm:pb-10 sm:pt-14">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
          <Link
            href="/blogs/blog-grid"
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-rust hover:text-brand-ink"
          >
            ← Listening Room
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-ink/50">
            {category ? (
              <span className="text-brand-rust">{category.title}</span>
            ) : null}
            {category ? <span aria-hidden>•</span> : null}
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden>•</span>
            <span>{minutes} min read</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {article.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-brand-ink/70 [max-width:65ch]">
            {article.excerpt}
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 xl:px-0">
          <div className="relative aspect-[16/9] overflow-hidden bg-brand-ink/5 sm:aspect-[21/9]">
            <Image
              src={urlFor(article.heroImage)
                .width(1800)
                .height(900)
                .fit("crop")
                .auto("format")
                .url()}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="relative py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
          <div className="max-w-none">
            <PortableText
              value={article.body as never}
              components={portableTextComponents as never}
            />
          </div>

          {(author || article.tags?.length) && (
            <div className="mt-12 flex flex-wrap items-start justify-between gap-8 border-t border-brand-ink/10 pt-8">
              {author ? (
                <div className="flex max-w-md items-start gap-3">
                  {author.image ? (
                    <Image
                      src={urlFor(author.image).width(96).height(96).url()}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ink text-sm font-medium text-white">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-brand-ink">
                      {author.name}
                    </p>
                    {author.role ? (
                      <p className="text-xs text-brand-ink/55">{author.role}</p>
                    ) : null}
                    {author.bio ? (
                      <p className="mt-2 text-sm leading-relaxed text-brand-ink/65">
                        {author.bio}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {article.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      className="border border-brand-ink/10 bg-white/70 px-3 py-1 text-xs text-brand-ink/65"
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
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-brand-rust hover:text-brand-ink"
          >
            Back to the Listening Room
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetails;
