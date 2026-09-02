export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * App routes for Next.js Link / router — do not prepend basePath here.
 * next.config.js basePath is applied automatically by the framework.
 */
export const shopPath = "/shop-with-sidebar";
export const checkoutPath = "/checkout";
export const cartPath = "/cart";
export const orderConfirmationPath = "/order-confirmation";
export const orderStatusPath = "/order-status";
export const signInPath = "/signin";
export const myAccountPath = "/my-account";

export const productPath = (slug: string) => `/shop/${slug}`;

export const productHref = (slug?: string) =>
  slug ? productPath(slug) : shopPath;

/** Use only for raw browser URLs outside Next.js routing (e.g. absolute hrefs). */
export const withBasePath = (path: string) =>
  path.startsWith("/") ? `${basePath}${path}` : path;
