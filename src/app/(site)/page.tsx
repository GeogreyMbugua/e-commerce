import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop AudioVintage",
  description:
    "Browse curated vintage audio equipment and physical media from AudioVintage.",
  // other metadata
};

export default function HomePage() {
  return (
    <main>
      <ShopWithSidebar />
    </main>
  );
}
