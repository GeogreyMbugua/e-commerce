import React from "react";
import OrderConfirmationView from "@/components/Order/OrderConfirmationView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation | AudioVintage",
  description: "Your AudioVintage order confirmation.",
};

const OrderConfirmationPage = () => {
  return (
    <main>
      <OrderConfirmationView />
    </main>
  );
};

export default OrderConfirmationPage;
