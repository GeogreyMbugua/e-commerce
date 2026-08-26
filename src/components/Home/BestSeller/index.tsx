import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import shopData from "@/components/Shop/shopData";

const BestSeller = () => {
  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-8 flex items-center justify-between sm:mb-10">
          <div>
            <span className="mb-1.5 flex items-center gap-2.5 font-medium text-brand-rust">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
                className="opacity-90"
              />
              This Month
            </span>
            <h2 className="text-xl font-semibold text-brand-ink xl:text-heading-5">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7.5 lg:grid-cols-3">
          {/* <!-- Best Sellers item --> */}
          {shopData.slice(1, 7).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="mt-9 text-center sm:mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex rounded-md border border-brand-ink/15 bg-brand-cream px-7 py-3 text-sm font-medium text-brand-ink transition-colors duration-200 hover:border-brand-rust hover:bg-brand-rust hover:text-white sm:px-12.5"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
