import React from "react";
import PromoStrip from "@/components/Store/PromoStrip";
import CategoryScroller from "@/components/Store/CategoryScroller";
import NewArrival from "./NewArrivals";
import Featured from "./BestSeller";
import ShopByCategory from "@/components/Store/ShopByCategory";
import BrandStory from "@/components/Store/BrandStory";
import TrustServices from "@/components/Store/TrustServices";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";

const Home = () => {
  return (
    <main className="overflow-hidden pb-[clamp(1rem,3vw,2rem)]">
      <PromoStrip />

      <div className="store-rail">
        <CategoryScroller />
      </div>

      <div className="store-band store-band--warm mt-[clamp(0.5rem,2vw,1rem)]">
        <NewArrival />
      </div>

      <div className="store-band store-band--ink">
        <Featured />
      </div>

      <div className="store-band store-band--panel py-[clamp(0.5rem,2vw,1rem)]">
        <ShopByCategory />
      </div>

      <BrandStory />
      <TrustServices />

      <div className="store-band store-band--warm pt-[clamp(2.5rem,7vw,3.5rem)]">
        <Testimonials />
      </div>

      <div className="pb-2 pt-[clamp(1rem,3vw,1.5rem)]">
        <Newsletter />
      </div>
    </main>
  );
};

export default Home;
