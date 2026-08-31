"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
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
    imageClassName: "xl:translate-x-3",
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
    imageClassName: "xl:-translate-x-1",
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
    imageClassName: "xl:translate-x-2 xl:scale-105",
  },
] as const;

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={0}
      autoplay={{
        delay: 4500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={slide.eyebrow}>
          <div className="relative flex min-h-[clamp(460px,calc(100svh-230px),640px)] flex-col gap-0 px-6 pb-12 pt-10 sm:min-h-[560px] sm:px-10 sm:pb-10 sm:pt-12 xl:grid xl:min-h-[560px] xl:grid-cols-[0.85fr_1.15fr] xl:items-center xl:gap-4 xl:px-12.5 xl:py-12">
            <div className="relative z-10 w-full max-w-[430px] self-start xl:self-center">
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold sm:mb-6 xl:mb-7 xl:text-brand-rust">
                <span className="h-px w-8 bg-brand-gold xl:bg-brand-rust" aria-hidden="true" />
                {slide.eyebrow}
              </p>

              {index === 0 ? (
                <h1 className="mb-4 font-semibold leading-[1.05] tracking-tight text-brand-cream text-4xl sm:mb-5 sm:text-4xl xl:text-dark xl:text-5xl">
                  {slide.title.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h1>
              ) : (
                <h2 className="mb-4 font-semibold leading-[1.05] tracking-tight text-brand-cream text-4xl sm:mb-5 sm:text-4xl xl:text-dark xl:text-5xl">
                  {slide.title.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h2>
              )}

              <p className="max-w-[310px] text-sm leading-6 text-white/80 sm:max-w-[430px] sm:text-base sm:leading-7 xl:text-dark-3">
                {slide.description}
              </p>

              <Link
                href="/shop-with-sidebar"
                className="mt-6 inline-flex items-center gap-3 rounded-md bg-brand-cream px-6 py-3.5 text-sm font-medium text-brand-ink transition-colors duration-200 hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 sm:mt-8 sm:px-7 xl:bg-brand-ink xl:text-white xl:hover:bg-brand-rust xl:focus:ring-brand-rust"
              >
                {slide.cta}
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            <div className="relative mt-3 flex min-h-[230px] flex-none items-end justify-center pt-4 sm:min-h-[270px] sm:pt-8 xl:mt-1 xl:min-h-[420px] xl:flex-none xl:self-stretch">
              <div
                className="absolute left-1/2 top-[8%] h-64 w-64 -translate-x-1/2 rounded-full border border-brand-rust/20 sm:top-[10%] sm:h-72 sm:w-72 xl:left-auto xl:right-[8%] xl:top-[12%] xl:translate-x-0 xl:h-80 xl:w-80"
                aria-hidden="true"
              />
              <Image
                src={slide.image}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                priority={index === 0}
                sizes="(min-width: 1280px) 55vw, 90vw"
                className={`relative z-10 -translate-y-6 h-auto max-h-[240px] w-full max-w-[360px] object-contain max-[380px]:-translate-y-20 sm:max-h-[280px] sm:max-w-[500px] sm:translate-y-0 xl:max-h-none xl:max-w-[620px] ${slide.imageClassName}`}
              />
            </div>
            <span className="absolute bottom-4 right-6 z-20 text-xs font-medium tracking-[0.2em] text-white/80 max-[380px]:bottom-auto max-[380px]:top-[calc(100svh-270px)] xl:bottom-0 xl:right-3 xl:text-dark-4">
              {String(index + 1).padStart(2, "0")} / 03
            </span>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;