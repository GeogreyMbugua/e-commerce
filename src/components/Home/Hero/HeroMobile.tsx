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
import { heroSlides } from "./hero-slides";

const HeroMobile = () => {
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
    <div className="hero-mobile-shell relative overflow-hidden bg-brand-ink">
      <Swiper
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={reduceMotion ? 0 : 900}
        spaceBetween={0}
        autoplay={
          reduceMotion
            ? false
            : {
                delay: 6500,
                disableOnInteraction: false,
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
        className="hero-mobile-carousel"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-mobile-slide relative flex min-h-[calc(100svh-7.5rem)] flex-col">
              <Image
                src={slide.mobileBackground}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                aria-hidden="true"
                className="object-cover"
                style={{ objectPosition: slide.mobileBackgroundPosition }}
              />

              <div
                className="absolute inset-0 bg-gradient-to-b from-brand-ink/88 via-brand-ink/45 to-brand-ink/82"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-brand-ink/90 via-brand-ink/35 to-transparent"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-1 flex-col px-5 pb-24 pt-7">
                <div className="hero-mobile-copy flex flex-col">
                  <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    <span className="h-px w-7 bg-brand-gold" aria-hidden="true" />
                    {slide.eyebrow}
                  </p>

                  {index === 0 ? (
                    <h1 className="mb-4 font-semibold text-[2.125rem] leading-[1.04] tracking-tight text-brand-cream drop-shadow-[0_6px_25px_rgba(15,11,9,0.45)]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h1>
                  ) : (
                    <h2 className="mb-4 font-semibold text-[2.125rem] leading-[1.04] tracking-tight text-brand-cream drop-shadow-[0_6px_25px_rgba(15,11,9,0.45)]">
                      {slide.title.map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </h2>
                  )}

                  <p className="max-w-[20rem] text-sm leading-6 text-brand-cream/88">
                    {slide.description}
                  </p>

                  <Link
                    href={slide.ctaHref}
                    className="mt-6 inline-flex w-fit items-center gap-2.5 rounded-md bg-brand-cream px-6 py-3.5 text-sm font-medium text-brand-ink shadow-[0_8px_22px_rgba(15,11,9,0.28)] transition-colors duration-200 hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-ink/40"
                  >
                    {slide.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="hero-mobile-product relative mt-auto flex flex-1 items-end justify-center pb-2 pt-8">
                  <div
                    className="absolute bottom-[12%] left-1/2 h-[13.5rem] w-[13.5rem] -translate-x-1/2 rounded-full border border-brand-rust/25"
                    aria-hidden="true"
                  />
                  <Image
                    src={slide.productImage}
                    alt={slide.productAlt}
                    width={slide.productWidth}
                    height={slide.productHeight}
                    priority={index === 0}
                    sizes="92vw"
                    className={`relative z-10 h-auto w-full object-contain drop-shadow-[0_20px_44px_rgba(15,11,9,0.42)] ${slide.mobileProductClassName}`}
                  />
                </div>
              </div>

              <span
                className="absolute bottom-20 right-5 z-20 text-[11px] font-medium tracking-[0.22em] text-brand-cream/75"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-x-0 bottom-6 z-30 flex items-center px-5">
        <div
          ref={paginationRef}
          className="hero-carousel-pagination pointer-events-auto"
          aria-label="Hero carousel pagination"
        />
      </div>
    </div>
  );
};

export default HeroMobile;
