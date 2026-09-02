import React from "react";
import OrderLookupView from "@/components/Order/OrderLookupView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status | AudioVintage",
  description: "Look up your AudioVintage order by reference and email.",
};

const OrderStatusPage = () => {
  return (
    <main>
      <OrderLookupView />
    </main>
  );
};

export default OrderStatusPage;
