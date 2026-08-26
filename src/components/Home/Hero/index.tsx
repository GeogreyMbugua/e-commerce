import React from "react";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "@/components/Common/BrandedImage";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#a85e32] pb-10 pt-6 sm:pt-8 lg:pt-10">
      <Image
        src="/images/hero/hero4.webp"
        alt="Shelves of vintage audio equipment in a curated shop"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#6f351d]/75" aria-hidden="true" />

      <div className="relative z-10 max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white/95 overflow-hidden shadow-xl">
              <Image
                src="/images/hero/hero-bg.png"
                alt="Vintage audio background pattern"
                className="hero-pattern absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              <div className="w-full relative rounded-[10px] bg-white/95 p-4 sm:p-7.5 shadow-xl">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex-1">
                    <h2 className="font-semibold text-dark text-xl mb-3">
                      Turntables
                    </h2>
                    <p className="text-sm text-dark-4 leading-6">
                      Classic decks ready for their next spin.
                    </p>
                    <Link
                      href="/shop-with-sidebar"
                      className="mt-5 inline-flex items-center text-sm font-medium text-blue hover:text-dark"
                    >
                      Shop Turntables
                    </Link>
                  </div>

                  <div className="shrink-0">
                    <Image
                      src="/images/hero/turn3.png"
                      alt="Vintage turntable deck with a walnut finish"
                      width={128}
                      height={128}
                      className="h-auto w-[120px] object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full relative rounded-[10px] bg-white/95 p-4 sm:p-7.5 shadow-xl">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex-1">
                    <h2 className="font-semibold text-dark text-xl mb-3">
                      Vintage Speakers
                    </h2>
                    <p className="text-sm text-dark-4 leading-6">
                      Classic cabinets. Distinctive sound.
                    </p>
                    <Link
                      href="/shop-with-sidebar"
                      className="mt-5 inline-flex items-center text-sm font-medium text-blue hover:text-dark"
                    >
                      Explore Speakers
                    </Link>
                  </div>

                  <div className="shrink-0">
                    <Image
                      src="/images/hero/vintagespeaker2.png"
                      alt="Vintage speaker cabinet with a maple wood finish"
                      width={118}
                      height={138}
                      className="h-auto w-[110px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 border-t border-white/20 bg-brand-ink/85 py-7 sm:mt-12 sm:py-8">
        <HeroFeature />
      </div>
    </section>
  );
};

export default Hero;
