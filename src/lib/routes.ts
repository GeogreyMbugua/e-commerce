export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const withBasePath = (path: string) =>
  path.startsWith("/") ? `${basePath}${path}` : path;

export const shopPath = withBasePath("/shop-with-sidebar");

export const checkoutPath = withBasePath("/checkout");

export const cartPath = withBasePath("/cart");

export const orderConfirmationPath = withBasePath("/order-confirmation");

export const orderStatusPath = withBasePath("/order-status");

export const productPath = (slug: string) => withBasePath(`/shop/${slug}`);

export const productHref = (slug?: string) =>
  slug ? productPath(slug) : shopPath;
