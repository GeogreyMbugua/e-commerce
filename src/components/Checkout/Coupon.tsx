import React from "react";

const Coupon = () => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="Enter coupon code"
          className="w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
          />

          <button
            type="submit"
            className="inline-flex rounded-md bg-brand-ink px-6 py-3 font-medium text-white ease-out duration-200 hover:bg-brand-rust"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
