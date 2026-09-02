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
            <div className="hero-mobile-slide relative min-h-[clamp(520px,82svh,680px)] overflow-hidden">
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

              <div className="absolute inset-0 bg-brand-ink/15" aria-hidden="true" />
              <div
                className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-brand-ink/95 via-brand-ink/68 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-brand-ink/92 via-brand-ink/45 to-transparent"
                aria-hidden="true"
              />

              <div className="hero-mobile-copy relative z-20 px-5 pb-[min(42vh,240px)] pt-6">
                <div
                  className="pointer-events-none absolute -inset-x-5 -top-6 bottom-8 bg-gradient-to-b from-brand-ink/50 via-brand-ink/20 to-transparent"
                  aria-hidden="true"
                />

                <p className="relative mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  <span className="h-px w-7 bg-brand-gold" aria-hidden="true" />
                  {slide.eyebrow}
                </p>

                {index === 0 ? (
                  <h1 className="relative mb-3 font-semibold text-[2rem] leading-[1.04] tracking-tight text-[#f8f2e8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
                    {slide.title.map((line) => (
                      <span className="block" key={line}>
                        {line}
                      </span>
                    ))}
                  </h1>
                ) : (
                  <h2 className="relative mb-3 font-semibold text-[2rem] leading-[1.04] tracking-tight text-[#f8f2e8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
                    {slide.title.map((line) => (
                      <span className="block" key={line}>
                        {line}
                      </span>
                    ))}
                  </h2>
                )}

                <p className="relative line-clamp-3 max-w-[19rem] text-sm leading-6 text-[#f1eadf] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                  {slide.description}
                </p>

                <Link
                  href={slide.ctaHref}
                  className="relative mt-4 inline-flex w-fit items-center gap-2.5 rounded-md bg-[#f5efe7] px-6 py-3 text-sm font-medium text-brand-ink shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-ink/40"
                >
                  {slide.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="hero-mobile-product pointer-events-none absolute inset-x-0 bottom-[3.25rem] z-10 flex justify-center px-3">
                <div className="relative flex w-full max-w-[min(100%,400px)] items-end justify-center">
                  <div
                    className="absolute bottom-[8%] left-1/2 h-[min(38vw,11.5rem)] w-[min(38vw,11.5rem)] -translate-x-1/2 rounded-full border border-brand-rust/30"
                    aria-hidden="true"
                  />
                  <Image
                    src={slide.productImage}
                    alt={slide.productAlt}
                    width={slide.productWidth}
                    height={slide.productHeight}
                    priority={index === 0}
                    sizes="90vw"
                    className="relative z-10 h-auto w-full max-h-[min(40vh,280px)] object-contain object-bottom drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              <span
                className="absolute bottom-[3.25rem] right-5 z-30 text-[11px] font-medium tracking-[0.22em] text-[#f8f2e8]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-x-0 bottom-5 z-30 flex items-center px-5">
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
