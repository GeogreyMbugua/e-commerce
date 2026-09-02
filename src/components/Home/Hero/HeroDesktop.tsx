"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css";

import Image from "@/components/Common/BrandedImage";
import HeroFeature from "./HeroFeature";
import { heroSlides } from "./hero-slides";

const HeroDesktopCarousel = () => {
  const paginationRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div className="hero-carousel-shell relative">
      <Swiper
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={reduceMotion ? 0 : 1000}
        spaceBetween={0}
        autoplay={
          reduceMotion
            ? false
            : {
                delay: 6500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        pagination={{
          clickable: true,
          el: paginationRef.current,
        }}
        onBeforeInit={(swiper: SwiperType) => {
          if (typeof swiper.params.pagination === "object" && paginationRef.current) {
            swiper.params.pagination.el = paginationRef.current;
          }
        }}
        modules={[Autoplay, EffectFade, Pagination]}
        className="hero-carousel"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide relative grid min-h-[600px] grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] items-stretch gap-0 pb-16 2xl:min-h-[620px]">
              <div className="hero-slide-copy relative z-10 flex flex-col justify-center px-10 py-14 2xl:px-14 2xl:py-16">
                <div
                  className="pointer-events-none absolute inset-y-0 -left-10 right-0 2xl:-left-14"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/35 via-brand-ink/15 to-transparent" />
                </div>

                <div className="relative flex flex-col">
                  <p className="relative mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    <span className="h-px w-9 bg-brand-gold" aria-hidden="true" />
                    {slide.eyebrow}
                  </p>

                  {index === 0 ? (
                    <h1 className="relative mb-5 font-semibold text-[2.75rem] leading-[1.06] tracking-tight text-brand-cream drop-shadow-[0_4px_24px_rgba(15,11,9,0.55)] 2xl:text-[3rem]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h1>
                  ) : (
                    <h2 className="relative mb-5 font-semibold text-[2.75rem] leading-[1.06] tracking-tight text-brand-cream drop-shadow-[0_4px_24px_rgba(15,11,9,0.55)] 2xl:text-[3rem]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h2>
                  )}

                  <p className="relative max-w-[380px] text-base leading-7 text-brand-cream/85 drop-shadow-[0_2px_16px_rgba(15,11,9,0.45)]">
                    {slide.description}
                  </p>

                  <Link
                    href={slide.ctaHref}
                    className="relative mt-8 inline-flex w-fit items-center gap-2.5 rounded-md bg-brand-cream px-7 py-3.5 text-sm font-medium text-brand-ink shadow-[0_8px_24px_rgba(15,11,9,0.28)] transition-colors duration-200 hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-ink/40"
                  >
                    {slide.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="hero-slide-media relative flex items-center justify-end px-10 pb-0 pt-0 2xl:min-h-[500px] 2xl:px-14">
                <div
                  className="hero-slide-accent absolute right-[6%] top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full border border-brand-rust/25 2xl:right-[4%] 2xl:h-[24rem] 2xl:w-[24rem]"
                  aria-hidden="true"
                />
                <Image
                  src={slide.productImage}
                  alt={slide.productAlt}
                  width={slide.productWidth}
                  height={slide.productHeight}
                  priority={index === 0}
                  sizes="50vw"
                  className={`relative z-10 h-auto max-h-[min(42vw,440px)] w-full max-w-[min(52vw,640px)] object-contain drop-shadow-[0_24px_48px_rgba(37,36,42,0.22)] ${slide.desktopProductClassName}`}
                />
              </div>

              <span
                className="absolute bottom-6 right-10 z-20 text-xs font-medium tracking-[0.22em] text-brand-cream/75 2xl:right-14"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hero-carousel-nav absolute inset-x-0 bottom-6 z-30 flex items-center justify-between px-10 2xl:px-14">
        <div
          ref={paginationRef}
          className="hero-carousel-pagination pointer-events-auto"
          aria-label="Hero carousel pagination"
        />
      </div>
    </div>
  );
};

const HeroDesktop = () => {
  return (
    <section className="relative overflow-hidden bg-[#7a4528]">
      <Image
        src="/images/hero/hero-ackground-2.jpg"
        alt="Shelves of vintage audio equipment in a curated shop"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />

      <div className="absolute inset-0 bg-[#1d1713]/12" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_36%,rgba(27,22,19,0.06)_50%,rgba(27,22,19,0.16)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-6">
        <div className="flex items-stretch gap-5">
          <div className="min-w-0 flex-[1.15]">
            <HeroDesktopCarousel />
          </div>

          <div className="flex w-[340px] shrink-0 flex-col justify-center gap-4 py-10 2xl:w-[380px]">
            <Link
              href="/shop-with-sidebar?category=turntables"
              className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden border border-brand-ink/10 bg-brand-cream/70 p-6 backdrop-blur-[2px] transition-all duration-300 hover:border-brand-rust/30 hover:bg-brand-cream/78"
            >
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust/85">
                  Collection
                </p>
                <h2 className="mt-2 text-[1.65rem] font-semibold leading-tight text-brand-ink">
                  Turntables
                </h2>
                <p className="mt-2.5 text-sm leading-6 text-brand-ink/70">
                  Classic decks ready for their next spin.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-rust transition-colors duration-200 group-hover:text-brand-gold">
                  Shop Turntables
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
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
              href="/shop-with-sidebar?category=speakers"
              className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden border border-brand-ink/10 bg-brand-cream/70 p-6 backdrop-blur-[2px] transition-all duration-300 hover:border-brand-rust/30 hover:bg-brand-cream/78"
            >
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust/85">
                  Collection
                </p>
                <h2 className="mt-2 text-[1.65rem] font-semibold leading-tight text-brand-ink">
                  Vintage Speakers
                </h2>
                <p className="mt-2.5 text-sm leading-6 text-brand-ink/70">
                  Classic cabinets. Distinctive sound.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-rust transition-colors duration-200 group-hover:text-brand-gold">
                  Explore Speakers
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
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

      <div className="relative z-10 mt-0">
        <div
          className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent via-brand-ink/40 to-brand-ink/90"
          aria-hidden="true"
        />
        <div className="border-t border-brand-cream/15 bg-brand-ink py-10">
          <HeroFeature />
        </div>
      </div>
    </section>
  );
};

export default HeroDesktop;
