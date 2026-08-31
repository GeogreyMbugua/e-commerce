import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AudioVintage | Curated Vintage Audio & Physical Media",
  description:
    "Discover carefully selected vintage audio equipment and physical media at AudioVintage.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
