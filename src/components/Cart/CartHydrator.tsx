"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { hydrateCart } from "@/lib/cart-service";

const CartHydrator = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    void hydrateCart(dispatch);
  }, [dispatch]);

  return null;
};

export default CartHydrator;
