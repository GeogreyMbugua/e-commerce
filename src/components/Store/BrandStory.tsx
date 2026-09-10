import Link from "next/link";
import { shopPath } from "@/lib/routes";

const BrandStory = () => {
  return (
    <section id="about-audiovintage" className="pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden border-y border-brand-ink/10 bg-gradient-to-br from-[#fbf8f2]/90 via-[#f3ebe0]/70 to-[rgba(184,95,45,0.08)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div
            className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-rust">
              About AudioVintage
            </p>
            <h2 className="mb-3 max-w-2xl text-xl font-semibold text-brand-ink sm:text-2xl">
              Curated vintage audio, tested and ready to play
            </h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-brand-ink/75 sm:text-base">
              We source amplifiers, turntables, speakers, and physical media with care —
              restoring what needs attention and listing each piece with honest condition
              notes so you can shop with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={shopPath}
                className="inline-flex min-h-10 items-center bg-brand-rust px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
              >
                Browse the shop
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-10 items-center border border-brand-ink/20 bg-white/50 px-5 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:border-brand-rust hover:text-brand-rust"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
