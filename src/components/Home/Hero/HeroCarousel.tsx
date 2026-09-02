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

const slides = [
  {
    eyebrow: "VINTAGE HI-FI",
    title: ["Old Sound.", "Real Character."],
    description:
      "Discover carefully selected vintage speakers, turntables and classic hi-fi equipment for listeners who appreciate sound with history.",
    cta: "Explore the Collection",
    image: "/images/hero/3way.png",
    alt: "Vintage turntable and speakers setup in a boutique audio store",
    width: 674,
    height: 370,
    imageClassName: "xl:translate-x-4 xl:scale-[1.02]",
  },
  {
    eyebrow: "CLASSIC EQUIPMENT",
    title: ["Built to Be Heard."],
    description:
      "Explore vintage amplifiers, receivers, speakers and turntables selected for their character, craftsmanship and lasting appeal.",
    cta: "Shop Audio",
    image: "/images/hero/hero6.png",
    alt: "Classic vintage amplifier and receiver with a warm walnut finish",
    width: 612,
    height: 394,
    imageClassName: "xl:-translate-x-2 xl:scale-[1.04]",
  },
  {
    eyebrow: "PHYSICAL MEDIA",
    title: ["Own the Music.", "Keep the Format."],
    description:
      "Browse vinyl, CDs, cassettes and other physical media for collectors, enthusiasts and anyone who enjoys owning what they listen to.",
    cta: "Browse Media",
    image: "/images/hero/vinyleplayerandspeakers.png",
    alt: "Vintage record collection and media shelf in a curated vinyl shop",
    width: 500,
    height: 500,
    imageClassName: "xl:translate-x-3 xl:scale-105",
  },
] as const;

const HeroCarousal = () => {
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
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.eyebrow}>
            <div className="hero-slide relative flex min-h-[clamp(480px,calc(100svh-148px),660px)] flex-col px-5 pb-[4.25rem] pt-8 xsm:px-6 sm:min-h-[560px] sm:px-10 sm:pb-14 sm:pt-11 xl:grid xl:min-h-[600px] xl:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] xl:items-stretch xl:gap-0 xl:px-0 xl:pb-16 xl:pt-0 2xl:min-h-[620px]">
              <div className="hero-slide-copy relative z-10 flex w-full max-w-[420px] flex-col self-start xl:max-w-none xl:self-stretch xl:justify-center xl:px-10 xl:py-14 2xl:px-14 2xl:py-16">
                <div
                  className="pointer-events-none absolute inset-y-0 -left-10 right-0 hidden xl:block 2xl:-left-14"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-ink/35 via-brand-ink/15 to-transparent" />
                </div>

                <div className="relative flex flex-col">
                  <p className="relative mb-3.5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold xsm:mb-4 sm:mb-5 sm:text-xs xl:mb-6 xl:text-brand-gold">
                    <span
                      className="h-px w-7 bg-brand-gold xl:w-9 xl:bg-brand-gold"
                      aria-hidden="true"
                    />
                    {slide.eyebrow}
                  </p>

                  {index === 0 ? (
                    <h1 className="relative mb-3.5 font-semibold leading-[1.04] tracking-tight text-[#f8f2e8] text-[2rem] drop-shadow-[0_6px_25px_rgba(23,17,13,0.38)] xsm:text-[2.125rem] sm:mb-4 sm:text-4xl xl:mb-5 xl:text-[2.75rem] xl:leading-[1.06] xl:text-brand-cream xl:drop-shadow-[0_4px_24px_rgba(15,11,9,0.55)] 2xl:text-[3rem]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h1>
                  ) : (
                    <h2 className="relative mb-3.5 font-semibold leading-[1.04] tracking-tight text-[#f8f2e8] text-[2rem] drop-shadow-[0_6px_25px_rgba(23,17,13,0.38)] xsm:text-[2.125rem] sm:mb-4 sm:text-4xl xl:mb-5 xl:text-[2.75rem] xl:leading-[1.06] xl:text-brand-cream xl:drop-shadow-[0_4px_24px_rgba(15,11,9,0.55)] 2xl:text-[3rem]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h2>
                  )}

                  <p className="relative max-w-[320px] text-sm leading-6 text-[#f1eadf]/90 xsm:max-w-[340px] sm:max-w-[400px] sm:text-[15px] sm:leading-7 xl:max-w-[380px] xl:text-base xl:text-brand-cream/85 xl:drop-shadow-[0_2px_16px_rgba(15,11,9,0.45)]">
                    {slide.description}
                  </p>

                  <Link
                    href="/shop-with-sidebar"
                    className="relative mt-5 inline-flex w-fit items-center gap-2.5 rounded-md bg-[#f5efe7] px-6 py-3.5 text-sm font-medium text-brand-ink shadow-[0_8px_22px_rgba(21,15,10,0.18)] transition-colors duration-200 hover:bg-[#e8d5a2] focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-ink/30 sm:mt-6 sm:px-7 xl:mt-8 xl:bg-brand-cream xl:text-brand-ink xl:shadow-[0_8px_24px_rgba(15,11,9,0.28)] xl:hover:bg-brand-gold xl:focus:ring-brand-gold xl:focus:ring-offset-brand-ink/40"
                  >
                    {slide.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="hero-slide-media relative mt-2 flex flex-1 items-end justify-center pb-1 pt-3 xsm:mt-3 sm:mt-4 sm:min-h-[260px] sm:pt-5 xl:mt-0 xl:min-h-0 xl:flex-none xl:items-center xl:justify-end xl:px-10 xl:pb-0 xl:pt-0 2xl:min-h-[500px] 2xl:px-14">
                <div
                  className="hero-slide-accent absolute left-1/2 top-[6%] h-[15.5rem] w-[15.5rem] -translate-x-1/2 rounded-full border border-brand-rust/20 xsm:top-[8%] xsm:h-[16.5rem] xsm:w-[16.5rem] sm:top-[10%] sm:h-[18rem] sm:w-[18rem] xl:left-auto xl:right-[6%] xl:top-1/2 xl:h-[22rem] xl:w-[22rem] xl:-translate-y-1/2 xl:translate-x-0 xl:border-brand-rust/25 2xl:right-[4%] 2xl:h-[24rem] 2xl:w-[24rem]"
                  aria-hidden="true"
                />
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  priority={index === 0}
                  sizes="(min-width: 1280px) 50vw, 88vw"
                  className={`relative z-10 h-auto max-h-[min(52vw,240px)] w-full max-w-[min(92vw,380px)] object-contain drop-shadow-[0_18px_40px_rgba(37,36,42,0.28)] xsm:max-h-[min(54vw,260px)] xsm:max-w-[min(94vw,400px)] sm:max-h-[300px] sm:max-w-[480px] xl:max-h-[min(42vw,440px)] xl:max-w-[min(52vw,640px)] xl:drop-shadow-[0_24px_48px_rgba(37,36,42,0.22)] ${slide.imageClassName}`}
                />
              </div>

              <span
                className="hero-slide-counter absolute bottom-[1.15rem] right-5 z-20 text-[11px] font-medium tracking-[0.22em] text-white/75 xsm:right-6 sm:bottom-5 sm:right-10 sm:text-xs xl:bottom-6 xl:right-10 xl:text-brand-cream/75 2xl:right-14"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hero-carousel-nav absolute inset-x-0 bottom-[1.15rem] z-30 flex items-center justify-between px-5 xsm:px-6 sm:bottom-5 sm:px-10 xl:bottom-6 xl:px-10 2xl:px-14">
        <div
          ref={paginationRef}
          className="hero-carousel-pagination pointer-events-auto"
          aria-label="Hero carousel pagination"
        />
      </div>
    </div>
  );
};

export default HeroCarousal;
