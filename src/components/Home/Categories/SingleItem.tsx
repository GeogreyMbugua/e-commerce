import { Category } from "@/types/category";
import React from "react";
import Image from "@/components/Common/BrandedImage";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <Link
      href={`/shop-with-sidebar?category=${item.slug}`}
      className="group flex flex-col items-center rounded-md px-2 py-3 transition-colors duration-200 hover:bg-brand-cream"
    >
      <div className="relative mb-4 aspect-square w-full max-w-[150px] overflow-hidden rounded-md border border-brand-ink/10 bg-brand-cream">
        <Image
          src={item.img}
          alt={`${item.title} collection`}
          fill
          sizes="(min-width: 1200px) 150px, (min-width: 640px) 20vw, 42vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex min-h-12 items-center justify-center px-1">
        <h3 className="text-center text-sm font-medium leading-5 text-brand-ink transition-colors duration-200 group-hover:text-brand-rust">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
