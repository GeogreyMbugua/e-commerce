import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-10 sm:py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 mb-7.5 overflow-hidden rounded-lg bg-brand-cream px-4 py-12.5 sm:px-7.5 lg:px-14 lg:py-17.5 xl:px-19 xl:py-22.5">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="relative z-10 max-w-[500px] w-full">
              <span className="mb-3 block text-xl font-medium text-brand-rust">
                Restored Sound, Timeless Style
              </span>

              <h2 className="mb-5 text-xl font-bold text-brand-ink lg:text-heading-4 xl:text-heading-3">
                Save Up To 30% On Vintage Audio
              </h2>

              <p className="max-w-[430px] text-brand-ink/75">
                Discover warm analog performance, handcrafted finishes, and the rich
                character of classic hi-fi pieces rebuilt for modern listening.
              </p>

              <a
                href="#"
                className="mt-7.5 inline-flex rounded-md bg-brand-rust px-9.5 py-[11px] text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-ink"
              >
                Shop The Drop
              </a>
            </div>

            <div className="relative flex w-full items-end justify-center lg:flex-1 lg:justify-end">
              <Image
                src="/images/promo/3way.png"
                alt="Vintage audio promo"
                className="h-56 w-auto object-contain sm:h-72 lg:h-[420px] xl:h-[470px]"
                width={620}
                height={720}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#F4E6D4] px-4 py-8 sm:px-7.5 sm:py-10 xl:px-10 xl:py-16">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-md sm:h-[180px] sm:w-[180px]">
                <Image
                  src="/images/promo/hero1.png"
                  alt="JVC vintage audio promo"
                  className="h-full w-full object-contain"
                  width={180}
                  height={180}
                />
              </div>

              <div className="flex-1 text-center sm:text-right">
                <span className="mb-1.5 block text-lg font-medium text-brand-ink">
                  Turntable Classics
                </span>

                <h2 className="mb-2.5 text-xl font-bold text-brand-ink lg:text-heading-4">
                  Analog Listening, Reimagined
                </h2>

                <p className="text-custom-1 font-semibold text-brand-rust">
                  Save 20% On Signature Pieces
                </p>

                <a
                  href="#"
                  className="mt-9 inline-flex rounded-md bg-brand-ink px-8.5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-rust"
                >
                  Explore Audio
                </a>
              </div>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#F8EFE7] px-4 py-8 sm:px-7.5 sm:py-10 xl:px-10 xl:py-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <span className="mb-1.5 block text-lg font-medium text-brand-ink">
                  Collector’s Set
                </span>

                <h2 className="mb-2.5 text-xl font-bold text-brand-ink lg:text-heading-4">
                  Vintage Audio, <span className="text-brand-rust">Up To 40%</span> Off
                </h2>

                <p className="max-w-[285px] text-sm text-brand-ink/75">
                  Discover premium receivers and speakers from the golden age of
                  music listening.
                </p>

                <a
                  href="#"
                  className="mt-7.5 inline-flex rounded-md bg-brand-rust px-8.5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-ink"
                >
                  Shop Now
                </a>
              </div>

              <div className="relative order-first h-40 w-full shrink-0 overflow-hidden rounded-md sm:order-none sm:h-[170px] sm:w-[180px]">
                <Image
                  src="/images/promo/sansui.webp"
                  alt="Sansui vintage audio promo"
                  className="h-full w-full object-contain"
                  width={180}
                  height={170}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
