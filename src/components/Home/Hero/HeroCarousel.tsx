"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

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
    imageClassName: "lg:translate-x-3",
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
    imageClassName: "lg:-translate-x-1",
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
    imageClassName: "lg:translate-x-2 lg:scale-105",
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
          <div className="grid min-h-[580px] grid-cols-1 items-center gap-6 px-5 py-10 sm:min-h-[520px] sm:gap-2 sm:px-10 lg:min-h-[560px] lg:grid-cols-[0.85fr_1.15fr] lg:gap-4 lg:px-12.5 lg:py-12">
            <div className="relative z-10 max-w-[430px] self-center">
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-rust sm:mb-7">
                <span className="h-px w-8 bg-brand-rust" aria-hidden="true" />
                {slide.eyebrow}
              </p>

              {index === 0 ? (
                <h1 className="mb-6 font-semibold leading-tight tracking-tight text-dark text-3xl sm:mb-5 sm:text-4xl lg:text-5xl">
                  {slide.title.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h1>
              ) : (
                <h2 className="mb-6 font-semibold leading-tight tracking-tight text-dark text-3xl sm:mb-5 sm:text-4xl lg:text-5xl">
                  {slide.title.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h2>
              )}

              <p className="max-w-[430px] text-dark-3 leading-7 sm:leading-7">
                {slide.description}
              </p>

              <Link
                href="/shop-with-sidebar"
                className="mt-9 inline-flex items-center gap-3 rounded-md bg-brand-ink px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-rust focus:outline-none focus:ring-2 focus:ring-brand-rust focus:ring-offset-2 sm:mt-10"
              >
                {slide.cta}
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            <div className="relative mt-1 flex min-h-[235px] items-center justify-center self-stretch sm:mt-0 sm:min-h-[270px] lg:min-h-[420px]">
              <div
                className="absolute right-[8%] top-[12%] h-44 w-44 rounded-full border border-brand-rust/20 sm:h-60 sm:w-60 lg:h-80 lg:w-80"
                aria-hidden="true"
              />
              <Image
                src={slide.image}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                priority={index === 0}
                sizes="(min-width: 1024px) 55vw, 90vw"
                className={`relative z-10 h-auto w-full max-w-[500px] object-contain sm:max-w-[560px] lg:max-w-[620px] ${slide.imageClassName}`}
              />
              <span className="absolute bottom-1 right-2 z-20 text-xs font-medium tracking-[0.2em] text-dark-4 sm:bottom-2 lg:bottom-0 lg:right-3">
                {String(index + 1).padStart(2, "0")} / 03
              </span>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;