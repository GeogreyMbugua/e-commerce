import React from "react";
import Image from "@/components/Common/BrandedImage";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Tested Before Listing",
    description: "Audio equipment is checked before it reaches the shop.",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Honest Condition",
    description: "Wear and imperfections are clearly described.",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "Secure Payments",
    description: "Safe and convenient checkout.",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "Carefully Selected",
    description: "Vintage pieces chosen for their character.",
  },
];

const HeroFeature = () => {
  return (
    <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 xl:px-6">
      <div className="flex gap-5 overflow-x-auto pb-1 no-scrollbar sm:gap-6 xl:grid xl:grid-cols-4 xl:gap-10 xl:overflow-visible xl:pb-0">
        {featureData.map((item, key) => (
          <div
            className="flex min-w-[220px] shrink-0 items-start gap-4 border-t border-white/10 pt-6 first:border-t-0 first:pt-0 sm:min-w-[260px] xl:min-w-0 xl:shrink xl:border-l xl:border-t-0 xl:border-brand-cream/15 xl:pl-8 xl:pt-0 xl:first:border-l-0 xl:first:pl-0"
            key={key}
          >
            <Image
              src={item.img}
              alt=""
              aria-hidden="true"
              width={40}
              height={41}
              className="mt-0.5 shrink-0 brightness-0 invert opacity-90 xl:opacity-95"
            />

            <div>
              <h3 className="font-medium text-base text-brand-gold sm:text-lg xl:text-brand-gold/90">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-white/72 xl:text-brand-cream/85">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
