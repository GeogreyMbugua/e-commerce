import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AudioVintage | Audio Vintage - Home",
  description: "This is Home for AudioVintage website",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
