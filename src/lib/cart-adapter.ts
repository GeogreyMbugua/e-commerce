import type { Cart } from "@/types/cart";
import type { CartItem } from "@/redux/features/cart-slice";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/product-images";

const slugIdMap = new Map<string, number>();

const stableNumericId = (slug: string) => {
  const existing = slugIdMap.get(slug);
  if (existing) {
    return existing;
  }

  const nextId = slugIdMap.size + 1;
  slugIdMap.set(slug, nextId);
  return nextId;
};

export const cartLineToViewItem = (line: Cart["lines"][number]): CartItem => {
  const imageUrl = line.primaryImage?.url ?? DEFAULT_PRODUCT_IMAGE;

  return {
    slug: line.productSlug,
    title: line.title,
    price: line.unitPrice.amountMinor / 100,
    discountedPrice: line.unitPrice.amountMinor / 100,
    id: stableNumericId(line.productSlug),
    quantity: line.quantity,
    imageAlt: line.primaryImage?.altText ?? line.title,
    primaryImageUrl: imageUrl,
    imgs: {
      thumbnails: [imageUrl],
      previews: [imageUrl],
      alts: [line.primaryImage?.altText ?? line.title],
    },
  };
};

export const cartToViewItems = (cart: Cart) =>
  cart.lines.map(cartLineToViewItem);

export const cartSubtotalDollars = (cart: Cart) =>
  cart.subtotal.amountMinor / 100;
