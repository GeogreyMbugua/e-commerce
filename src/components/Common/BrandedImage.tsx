import NextImage, { type ImageProps } from "next/image";
import { normalizeProductImageUrl } from "@/lib/product-images";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const withStaticBasePath = (src: string) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (basePath && src.startsWith(basePath)) {
    return src;
  }

  return src.startsWith("/") ? `${basePath}${src}` : src;
};

const BrandedImage = ({ src, ...props }: ImageProps) => {
  const resolvedSrc =
    typeof src === "string"
      ? withStaticBasePath(normalizeProductImageUrl(src))
      : src;

  return <NextImage src={resolvedSrc} {...props} />;
};

export default BrandedImage;
