import React from "react";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "@/components/Common/BrandedImage";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#7a4528]">
      <Image
        src="/images/hero/hero-ackground-2.jpg"
        alt="Shelves of vintage audio equipment in a curated shop"
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-[center_30%] xl:block"
      />
      <Image
        src="/images/hero/hero-background.jpg"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
        className="hidden object-cover object-center sm:block xl:hidden"
      />
      <Image
        src="/images/hero/canva2.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="block object-cover object-[62%_center] sm:hidden"
      />

      {/* Atmospheric overlays — localized, not a flat wash */}
      <div
        className="absolute inset-0 bg-[#2d1f1a]/10 sm:bg-[#2d1f1a]/18 xl:bg-[#1d1713]/12"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden xl:block bg-[linear-gradient(to_right,transparent_0%,transparent_36%,rgba(27,22,19,0.06)_50%,rgba(27,22,19,0.16)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/75 via-brand-ink/30 to-transparent sm:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-brand-ink/70 via-brand-ink/25 to-transparent sm:hidden"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-0 sm:px-8 xl:px-6">
        <div className="flex flex-col xl:flex-row xl:items-stretch xl:gap-5">
          <div className="w-full xl:min-w-0 xl:flex-[1.15]">
            <HeroCarousel />
          </div>

          <div className="hidden xl:flex xl:w-[340px] xl:shrink-0 xl:flex-col xl:justify-center xl:gap-4 xl:py-10 2xl:w-[380px]">
            <Link
              href="/shop-with-sidebar"
              className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden border border-brand-ink/10 bg-brand-cream/70 p-6 backdrop-blur-[2px] transition-all duration-300 hover:border-brand-rust/30 hover:bg-brand-cream/78"
            >
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust/85">
                  Collection
                </p>
                <h2 className="mt-2 font-semibold text-[1.65rem] leading-tight text-brand-ink">
                  Turntables
                </h2>
                <p className="mt-2.5 text-sm leading-6 text-brand-ink/70">
                  Classic decks ready for their next spin.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-rust transition-colors duration-200 group-hover:text-brand-gold">
                  Shop Turntables
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
              <Image
                src="/images/hero/turn3.png"
                alt=""
                aria-hidden="true"
                width={148}
                height={148}
                className="pointer-events-none absolute -bottom-2 -right-1 h-auto w-[130px] object-contain opacity-95 transition-transform duration-500 group-hover:scale-[1.04] group-hover:-translate-y-1"
              />
            </Link>

            <Link
              href="/shop-with-sidebar"
              className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden border border-brand-ink/10 bg-brand-cream/70 p-6 backdrop-blur-[2px] transition-all duration-300 hover:border-brand-rust/30 hover:bg-brand-cream/78"
            >
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust/85">
                  Collection
                </p>
                <h2 className="mt-2 font-semibold text-[1.65rem] leading-tight text-brand-ink">
                  Vintage Speakers
                </h2>
                <p className="mt-2.5 text-sm leading-6 text-brand-ink/70">
                  Classic cabinets. Distinctive sound.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-rust transition-colors duration-200 group-hover:text-brand-gold">
                  Explore Speakers
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
              <Image
                src="/images/hero/vintagespeaker2.png"
                alt=""
                aria-hidden="true"
                width={128}
                height={150}
                className="pointer-events-none absolute bottom-0 right-0 h-auto w-[118px] object-contain opacity-95 transition-transform duration-500 group-hover:scale-[1.04] group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-0 sm:mt-2 xl:mt-0">
        <div
          className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-brand-ink/90 sm:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-b from-transparent via-brand-ink/40 to-brand-ink/90 hidden sm:block xl:-top-24 xl:h-24"
          aria-hidden="true"
        />
        <div className="border-t border-brand-cream/10 bg-brand-ink/92 py-8 backdrop-blur-[2px] sm:py-9 xl:border-brand-cream/15 xl:bg-brand-ink xl:py-10">
          <HeroFeature />
        </div>
      </div>
    </section>
  );
};

export default Hero;
