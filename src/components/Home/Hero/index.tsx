import React from "react";
import HeroDesktop from "./HeroDesktop";
import HeroMobile from "./HeroMobile";
import HeroMobileCollectionRail from "./HeroMobileCollectionRail";
import HeroFeature from "./HeroFeature";

type HeroProps = {
  collapsed?: boolean;
};

const Hero = ({ collapsed = false }: HeroProps) => {
  return (
    <>
      <div className={`xl:hidden${collapsed ? " hero-intro-collapsed" : ""}`}>
        <HeroMobile collapsed={collapsed} />
        <div
          className={`hero-mobile-secondary overflow-hidden transition-[max-height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            collapsed ? "max-h-0 opacity-0" : "max-h-[480px] opacity-100"
          }`}
        >
          <HeroMobileCollectionRail />
          <section className="border-t border-brand-ink/10 bg-brand-ink py-8">
            <HeroFeature />
          </section>
        </div>
      </div>

      <div className="hidden xl:block">
        <HeroDesktop collapsed={collapsed} />
      </div>
    </>
  );
};

export default Hero;
