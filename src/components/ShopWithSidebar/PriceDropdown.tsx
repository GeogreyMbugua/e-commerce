"use client";

import { useEffect, useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

type PriceDropdownProps = {
  minPriceMinor?: number;
  maxPriceMinor?: number;
  onChange: (range: {
    minPriceMinor?: number;
    maxPriceMinor?: number;
  }) => void;
  flat?: boolean;
};

const minorToMajor = (value?: number) =>
  value !== undefined ? Math.round(value / 100) : undefined;

const majorToMinor = (value: number) => Math.round(value * 100);

const PriceDropdown = ({
  minPriceMinor,
  maxPriceMinor,
  onChange,
  flat = false,
}: PriceDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState({
    from: minorToMajor(minPriceMinor) ?? 0,
    to: minorToMajor(maxPriceMinor) ?? 1000,
  });

  useEffect(() => {
    setSelectedPrice({
      from: minorToMajor(minPriceMinor) ?? 0,
      to: minorToMajor(maxPriceMinor) ?? 1000,
    });
  }, [minPriceMinor, maxPriceMinor]);

  const applyRange = (from: number, to: number) => {
    onChange({
      minPriceMinor: from > 0 ? majorToMinor(from) : undefined,
      maxPriceMinor: to < 1000 ? majorToMinor(to) : undefined,
    });
  };

  return (
    <div className={flat ? "" : "border border-brand-ink/10 bg-white/70"}>
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="flex cursor-pointer items-center justify-between px-4 py-3"
      >
        <p className="text-sm font-medium text-brand-ink">Price</p>
        <button
          type="button"
          aria-label="Toggle price filter"
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

      <div className={`px-4 pb-4 ${toggleDropdown ? "block" : "hidden"}`}>
        <div className="price-range">
          <RangeSlider
            id="range-slider-gradient"
            className="margin-lg"
            min={0}
            max={1000}
            step={5}
            value={[selectedPrice.from, selectedPrice.to]}
            onInput={(values) => {
              const from = Math.floor(values[0]);
              const to = Math.ceil(values[1]);
              setSelectedPrice({ from, to });
              applyRange(from, to);
            }}
          />

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex flex-1 items-center border border-brand-ink/15 bg-white/60 text-xs text-brand-ink/70">
              <span className="border-r border-brand-ink/15 px-2.5 py-2">$</span>
              <span className="px-3 py-2">{selectedPrice.from}</span>
            </div>
            <span className="text-brand-ink/40" aria-hidden="true">
              –
            </span>
            <div className="flex flex-1 items-center border border-brand-ink/15 bg-white/60 text-xs text-brand-ink/70">
              <span className="border-r border-brand-ink/15 px-2.5 py-2">$</span>
              <span className="px-3 py-2">{selectedPrice.to}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
