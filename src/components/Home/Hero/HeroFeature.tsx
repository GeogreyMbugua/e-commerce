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
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {featureData.map((item, key) => (
          <div className="flex items-start gap-4" key={key}>
            <Image
              src={item.img}
              alt=""
              aria-hidden="true"
              width={40}
              height={41}
              className="mt-1 shrink-0 brightness-0 invert"
            />

            <div>
              <h3 className="font-medium text-lg text-brand-gold">{item.title}</h3>
              <p className="text-sm leading-6 text-white/75">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
