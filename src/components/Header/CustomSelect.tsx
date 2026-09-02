"use client";

import React, { useEffect, useRef, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(options[0]?.value ?? "0");
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: SelectOption) => {
    if (!value) {
      setInternalValue(option.value);
    }

    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className="dropdown-content custom-select relative"
      style={{ width: "200px" }}
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption?.value === option.value ? "same-as-selected" : ""
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
