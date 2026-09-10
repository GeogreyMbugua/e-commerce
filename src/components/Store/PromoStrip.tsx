import Link from "next/link";
import Image from "@/components/Common/BrandedImage";
import { shopPath } from "@/lib/routes";

/**
 * Compact commerce promo using hero photography.
 * Contained in page gutters (not viewport full-bleed) so edges stay aligned
 * with search / categories on every breakpoint.
 */
const PromoStrip = () => {
  return (
    <section aria-label="Featured promotion" className="pt-2 sm:pt-3">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="relative isolate overflow-hidden">
          {/* Hero photography — clipped to the content column */}
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/images/hero/hero-background.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 1170px) 100vw, 1170px"
              className="object-cover object-[48%_38%] sm:object-[center_40%] lg:object-[center_42%]"
            />
            <div className="absolute inset-0 bg-brand-ink/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/90 via-brand-ink/55 to-brand-ink/20 sm:via-brand-ink/50" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-ink/65 to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-[140px] items-end gap-3 px-4 py-4 sm:min-h-[160px] sm:items-center sm:gap-6 sm:px-6 sm:py-5 md:min-h-[176px] lg:min-h-[192px] lg:px-8 lg:py-6">
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold sm:text-[11px]">
                <span
                  className="inline-block h-px w-5 shrink-0 bg-brand-gold"
                  aria-hidden="true"
                />
                Fresh arrivals
              </p>
              <h2 className="mb-3 max-w-[15rem] text-base font-semibold leading-snug text-[#f5efe7] sm:max-w-sm sm:text-lg md:max-w-md md:text-xl lg:text-2xl">
                New vintage pieces, ready to shop
              </h2>
              <Link
                href={`${shopPath}?sort=newest`}
                className="inline-flex min-h-10 items-center bg-brand-cream px-4 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-ink/40"
              >
                Shop New Arrivals
              </Link>
            </div>

            {/* Product accent — sized so it never spills past the frame */}
            <div className="relative h-24 w-24 shrink-0 self-end sm:h-28 sm:w-32 sm:self-center md:h-32 md:w-40 lg:h-36 lg:w-48">
              <Image
                src="/images/hero/3way.png"
                alt=""
                fill
                sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 192px"
                className="object-contain object-bottom sm:object-right"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoStrip;
