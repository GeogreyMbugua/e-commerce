import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Image from "@/components/Common/BrandedImage";
import { removeProductFromCart } from "@/lib/cart-service";
import { getProductPreviewAlt, getProductPreviewUrl } from "@/lib/product-images";

const SingleItem = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromCart = async () => {
    if (!item.slug) {
      return;
    }

    await removeProductFromCart(dispatch, item.slug);
  };

  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex w-full items-center gap-6">
        <div className="flex h-22.5 w-full max-w-[90px] items-center justify-center rounded-[10px] bg-gray-3">
          <Image
            src={getProductPreviewUrl(item)}
            alt={getProductPreviewAlt(item)}
            width={100}
            height={100}
          />
        </div>

        <div>
          <h3 className="mb-1 font-medium text-dark ease-out duration-200 hover:text-blue">
            <a href="#"> {item.title} </a>
          </h3>
          <p className="text-custom-sm">Price: ${item.discountedPrice}</p>
        </div>
      </div>

      <button
        onClick={() => void handleRemoveFromCart()}
        aria-label="button for remove product from cart"
        className="flex h-9.5 w-full max-w-[38px] items-center justify-center rounded-lg border border-gray-3 bg-gray-2 text-dark duration-200 ease-out hover:border-red-light-4 hover:bg-red-light-6 hover:text-red"
      >
        <svg
          className="fill-current"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.45017 2.06252H12.5498C12.7482 2.06239 12.921 2.06228 13.0842 2.08834C13.7289 2.19129 14.2868 2.59338 14.5883 3.17244C14.6646 3.319 14.7192 3.48298 14.7818 3.6712L14.8841 3.97819C14.9014 4.03015 14.9064 4.04486 14.9105 4.05645C15.0711 4.50022 15.4873 4.80021 15.959 4.81217C15.9714 4.81248 15.9866 4.81254 16.0417 4.81254H18.7917C19.1714 4.81254 19.4792 5.12034 19.4792 5.50004C19.4792 5.87973 19.1714 6.18754 18.7917 6.18754H3.20825C2.82856 6.18754 2.52075 5.87973 2.52075 5.50004C2.52075 5.12034 2.82856 4.81254 3.20825 4.81254H5.95833C6.01337 4.81254 6.02856 4.81248 6.04097 4.81217C6.51273 4.80021 6.92892 4.50024 7.08944 4.05647C7.09366 4.0448 7.09852 4.03041 7.11592 3.97819L7.21823 3.67122C7.28083 3.48301 7.33538 3.319 7.41171 3.17244C7.71324 2.59339 8.27112 2.19129 8.91581 2.08834C9.079 2.06228 9.25181 2.06239 9.45017 2.06252Z"
            fill=""
          />
        </svg>
      </button>
    </div>
  );
};

export default SingleItem;
