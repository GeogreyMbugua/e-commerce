import Link from "next/link";
import { heroCollectionRail } from "./hero-slides";

const HeroMobileCollectionRail = () => {
  return (
    <section
      aria-label="Explore collections"
      className="border-b border-brand-ink/10 bg-brand-cream px-5 py-8"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust">
          Explore the Collection
        </p>
        <h2 className="mt-2 text-xl font-semibold text-brand-ink">
          Browse by category
        </h2>

        <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
          {heroCollectionRail.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-ink/12 bg-white px-5 py-3 text-sm font-medium text-brand-ink transition-colors duration-200 hover:border-brand-rust hover:text-brand-rust"
            >
              {item.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroMobileCollectionRail;
