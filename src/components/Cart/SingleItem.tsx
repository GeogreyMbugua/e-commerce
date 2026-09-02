import React, { useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  removeProductFromCart,
  updateProductQuantityInCart,
} from "@/lib/cart-service";
import { getProductPreviewAlt, getProductPreviewUrl } from "@/lib/product-images";

import Image from "@/components/Common/BrandedImage";

const SingleItem = ({ item }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveFromCart = async () => {
    if (!item.slug) {
      return;
    }

    await removeProductFromCart(dispatch, item.slug);
  };

  const handleIncreaseQuantity = async () => {
    if (!item.slug) {
      return;
    }

    const nextQuantity = quantity + 1;
    setQuantity(nextQuantity);
    await updateProductQuantityInCart(dispatch, {
      slug: item.slug,
      quantity: nextQuantity,
    });
  };

  const handleDecreaseQuantity = async () => {
    if (!item.slug || quantity <= 1) {
      return;
    }

    const nextQuantity = quantity - 1;
    setQuantity(nextQuantity);
    await updateProductQuantityInCart(dispatch, {
      slug: item.slug,
      quantity: nextQuantity,
    });
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5">
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="flex w-full items-center gap-5.5">
            <div className="flex h-17.5 w-full max-w-[80px] items-center justify-center rounded-[5px] bg-gray-2">
              <Image
                width={200}
                height={200}
                src={getProductPreviewUrl(item)}
                alt={getProductPreviewAlt(item)}
              />
            </div>

            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href="#"> {item.title} </a>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-[180px]">
        <p className="text-dark">${item.discountedPrice}</p>
      </div>

      <div className="min-w-[275px]">
        <div className="flex w-max items-center rounded-md border border-gray-3">
          <button
            onClick={() => void handleDecreaseQuantity()}
            aria-label="button for remove product"
            className="flex h-11 w-11 items-center justify-center duration-200 ease-out hover:text-blue"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.16699 10.0001C4.16699 9.53984 4.54015 9.16667 5.00033 9.16667H15.0003C15.4606 9.16667 15.8337 9.53984 15.8337 10.0001C15.8337 10.4603 15.4606 10.8335 15.0003 10.8335H5.00033C4.54015 10.8335 4.16699 10.4603 4.16699 10.0001Z"
                fill=""
              />
            </svg>
          </button>

          <span className="flex h-11 w-16 items-center justify-center border-x border-gray-3">
            {quantity}
          </span>

          <button
            onClick={() => void handleIncreaseQuantity()}
            aria-label="button for add product"
            className="flex h-11 w-11 items-center justify-center duration-200 ease-out hover:text-blue"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0003 4.16667C10.4606 4.16667 10.8337 4.53984 10.8337 5.00001V9.16668H15.0003C15.4606 9.16668 15.8337 9.53984 15.8337 10.0001C15.8337 10.4603 15.4606 10.8335 15.0003 10.8335H10.8337V15.0001C10.8337 15.4603 10.4606 15.8335 10.0003 15.8335C9.54015 15.8335 9.16699 15.4603 9.16699 15.0001V10.8335H5.00033C4.54015 10.8335 4.16699 10.4603 4.16699 10.0001C4.16699 9.53984 4.54015 9.16668 5.00033 9.16668H9.16699V5.00001C9.16699 4.53984 9.54015 4.16667 10.0003 4.16667Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="min-w-[180px]">
        <p className="text-dark">${item.discountedPrice * quantity}</p>
      </div>

      <div className="min-w-[50px]">
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
    </div>
  );
};

export default SingleItem;
