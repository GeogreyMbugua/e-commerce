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
  flat?: boolean;
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
          selected ? "bg-brand-rust text-white" : "bg-brand-ink/8 text-brand-ink/70"
        } inline-flex min-w-6 items-center justify-center px-1.5 py-0.5 text-[10px] font-medium`}
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
  flat = false,
}: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className={flat ? "" : "border border-brand-ink/10 bg-white/70"}>
      <div
        onClick={(event) => {
          event.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className="flex cursor-pointer items-center justify-between px-4 py-3"
      >
        <p className="text-sm font-medium text-brand-ink">Category</p>
        <button
          type="button"
          aria-label="Toggle category filters"
          className={`text-brand-ink transition-transform duration-200 ${
            toggleDropdown ? "rotate-180" : ""
          }`}
        >
          <svg
            className="fill-current"
            width="20"
            height="20"
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
        className={`flex-col gap-3 px-4 pb-4 ${
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
