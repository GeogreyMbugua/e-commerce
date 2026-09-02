"use client";

import { useState } from "react";

export type CategoryFilterOption = {
  slug: string;
  name: string;
  productCount: number;
};

type CategoryDropdownProps = {
  categories: CategoryFilterOption[];
  selectedSlug?: string;
  onChange: (slug?: string) => void;
};

const CategoryItem = ({
  category,
  selected,
  onSelect,
}: {
  category: CategoryFilterOption;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      className={`${
        selected && "text-brand-rust"
      } group flex items-center justify-between ease-out duration-200 hover:text-brand-rust`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border ${
            selected ? "border-brand-rust bg-brand-rust" : "border-gray-3 bg-white"
          }`}
        >
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span>{category.name}</span>
      </div>

      <span
        className={`${
          selected ? "bg-brand-rust text-white" : "bg-gray-2"
        } inline-flex rounded-[30px] px-2 text-custom-xs ease-out duration-200 group-hover:bg-brand-rust group-hover:text-white`}
      >
        {category.productCount}
      </span>
    </button>
  );
};

const CategoryDropdown = ({
  categories,
  selectedSlug,
  onChange,
}: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="rounded-lg bg-white shadow-1">
      <div
        onClick={(event) => {
          event.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`flex cursor-pointer items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Category</p>
        <button
          type="button"
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {categories.map((category) => (
          <CategoryItem
            key={category.slug}
            category={category}
            selected={selectedSlug === category.slug}
            onSelect={() =>
              onChange(selectedSlug === category.slug ? undefined : category.slug)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
