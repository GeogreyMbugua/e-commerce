"use client";

import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { shopPath } from "@/lib/routes";

const BlogShopCategories = () => {
  const { categories, loading } = useCatalogCategories();

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Popular Category</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-5 w-full animate-pulse rounded bg-gray-2"
                />
              ))
            : categories.map((category) => (
                <a
                  key={category.slug}
                  href={`${shopPath}?category=${category.slug}`}
                  className="group flex items-center justify-between text-dark ease-out duration-200 hover:text-brand-rust"
                >
                  {category.name}
                  <span className="inline-flex rounded-[30px] bg-gray-2 px-1.5 text-custom-xs ease-out duration-200 group-hover:bg-brand-rust group-hover:text-white">
                    {category.productCount}
                  </span>
                </a>
              ))}
        </div>
      </div>
    </div>
  );
};

export default BlogShopCategories;
