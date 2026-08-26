import NextImage, { type ImageProps } from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const BrandedImage = ({ src, ...props }: ImageProps) => {
  const prefixedSrc =
    typeof src === "string" && src.startsWith("/images/")
      ? `${basePath}${src}`
      : src;

  return <NextImage src={prefixedSrc} {...props} />;
};

export default BrandedImage;
