declare module "*.css" {
  const styles: { readonly [key: string]: string };
  export default styles;
}

declare module "swiper/css";
declare module "swiper/css/navigation";
declare module "swiper/css/pagination";
declare module "swiper/css/effect-fade";
