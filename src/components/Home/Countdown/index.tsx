"use client";
import React, { useState, useEffect } from "react";
import Image from "@/components/Common/BrandedImage";

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const deadline = "December, 31, 2026";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    // @ts-ignore
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-10 sm:py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F3E7D9] p-5 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="relative z-10 w-full max-w-[422px]">
            <span className="mb-2.5 block text-custom-1 font-medium text-brand-rust">
              Limited Drop
            </span>

            <h2 className="mb-3 text-xl font-bold text-brand-ink lg:text-heading-4 xl:text-heading-3">
              Panasonic SA-AK66 Stereo System
            </h2>

            <p className="text-brand-ink/75">
              A vintage 5-disc CD changer and dual cassette shelf stereo with a
              silver main unit, multi-way speakers, and surround-ready woofers.
            </p>

            {/* <!-- Countdown timer --> */}
            <div
              className="mt-6 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-6"
              x-data="timer()"
              x-init="countdown()"
            >
              {/* <!-- timer day --> */}
              <div>
                <span
                  className="mb-2 flex h-12 w-full items-center justify-center rounded-lg bg-white px-1 text-lg font-semibold text-brand-ink shadow-2 sm:h-14.5 sm:min-w-[64px] sm:px-4 sm:text-xl lg:text-3xl"
                  x-text="days"
                >
                  {" "}
                  {days < 10 ? "0" + days : days}{" "}
                </span>
                <span className="block text-center text-[10px] text-brand-ink/75 sm:text-custom-sm">
                  Days
                </span>
              </div>

              {/* <!-- timer hours --> */}
              <div>
                <span
                  className="mb-2 flex h-12 w-full items-center justify-center rounded-lg bg-white px-1 text-lg font-semibold text-brand-ink shadow-2 sm:h-14.5 sm:min-w-[64px] sm:px-4 sm:text-xl lg:text-3xl"
                  x-text="hours"
                >
                  {" "}
                  {hours < 10 ? "0" + hours : hours}{" "}
                </span>
                <span className="block text-center text-[10px] text-brand-ink/75 sm:text-custom-sm">
                  Hours
                </span>
              </div>

              {/* <!-- timer minutes --> */}
              <div>
                <span
                  className="mb-2 flex h-12 w-full items-center justify-center rounded-lg bg-white px-1 text-lg font-semibold text-brand-ink shadow-2 sm:h-14.5 sm:min-w-[64px] sm:px-4 sm:text-xl lg:text-3xl"
                  x-text="minutes"
                >
                  {minutes < 10 ? "0" + minutes : minutes}{" "}
                </span>
                <span className="block text-center text-[10px] text-brand-ink/75 sm:text-custom-sm">
                  Minutes
                </span>
              </div>

              {/* <!-- timer seconds --> */}
              <div>
                <span
                  className="mb-2 flex h-12 w-full items-center justify-center rounded-lg bg-white px-1 text-lg font-semibold text-brand-ink shadow-2 sm:h-14.5 sm:min-w-[64px] sm:px-4 sm:text-xl lg:text-3xl"
                  x-text="seconds"
                >
                  {seconds < 10 ? "0" + seconds : seconds}{" "}
                </span>
                <span className="block text-center text-[10px] text-brand-ink/75 sm:text-custom-sm">
                  Seconds
                </span>
              </div>
            </div>
            {/* <!-- Countdown timer ends --> */}

            <a
              href="#"
              className="mt-7.5 inline-flex w-full justify-center rounded-md bg-brand-rust px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-ink sm:w-auto sm:px-9.5"
            >
              Grab This Set
            </a>
          </div>

          <div className="relative z-10 mx-auto mt-8 h-52 w-full max-w-[300px] lg:hidden">
            <Image
              src="/images/countdown/count-down-01.webp"
              alt="Panasonic SA-AK66 stereo system"
              fill
              sizes="(max-width: 1024px) 300px"
              className="object-contain"
            />
          </div>

          {/* <!-- bg shapes --> */}
          <Image
            src="/images/countdown/countdown-bg.png"
            alt="bg shapes"
            className="hidden sm:block absolute right-0 bottom-0 -z-1"
            width={737}
            height={482}
          />
          <Image
            src="/images/countdown/count-down-01.webp"
            alt="product"
            className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1"
            width={411}
            height={376}
          />
        </div>
      </div>
    </section>
  );
};

export default CounDown;
