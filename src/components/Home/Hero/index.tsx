import React from "react";
import HeroDesktop from "./HeroDesktop";
import HeroMobile from "./HeroMobile";
import HeroMobileCollectionRail from "./HeroMobileCollectionRail";
import HeroFeature from "./HeroFeature";

const Hero = () => {
  return (
    <>
      <div className="xl:hidden">
        <HeroMobile />
        <HeroMobileCollectionRail />
        <section className="border-t border-brand-ink/10 bg-brand-ink py-8">
          <HeroFeature />
        </section>
      </div>

      <div className="hidden xl:block">
        <HeroDesktop />
      </div>
    </>
  );
};

export default Hero;
