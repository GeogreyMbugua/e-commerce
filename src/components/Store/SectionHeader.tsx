import Link from "next/link";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  href?: string;
  actionLabel?: string;
  id?: string;
};

const SectionHeader = ({
  eyebrow,
  title,
  href,
  actionLabel = "See All",
  id,
}: SectionHeaderProps) => {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
      <div>
        {eyebrow ? (
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-rust">
            {eyebrow}
          </span>
        ) : null}
        <h2
          id={id}
          className="text-lg font-semibold text-brand-ink sm:text-xl xl:text-heading-5"
        >
          {title}
        </h2>
      </div>

      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-brand-rust transition-colors hover:text-brand-ink"
        >
          {actionLabel}
          <span aria-hidden="true"> →</span>
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeader;
