"use client";

import React, { useEffect, useRef, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
};

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="custom-select custom-select-2 relative flex-shrink-0"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`select-item ${
              selectedOption.value === option.value ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
