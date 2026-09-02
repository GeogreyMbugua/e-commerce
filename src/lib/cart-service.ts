import type { AppDispatch } from "@/redux/store";
import {
  addCartLine,
  clearCart,
  createCart,
  ensureCart,
  fetchCurrentCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/cart";
import { cartToViewItems } from "@/lib/cart-adapter";
import { setCartFromServer } from "@/redux/features/cart-slice";

const syncCart = (dispatch: AppDispatch, cart: Awaited<ReturnType<typeof ensureCart>>) => {
  dispatch(setCartFromServer(cartToViewItems(cart)));
};

export async function hydrateCart(dispatch: AppDispatch) {
  const cart = await fetchCurrentCart();
  if (cart) {
    dispatch(setCartFromServer(cartToViewItems(cart)));
  }
}

export async function addProductToCart(
  dispatch: AppDispatch,
  input: { slug: string; quantity?: number },
) {
  if (!input.slug) {
    throw new Error("Product slug is required to add items to the cart.");
  }

  const cart = await addCartLine({
    productSlug: input.slug,
    quantity: input.quantity ?? 1,
  });
  syncCart(dispatch, cart);
}

export async function updateProductQuantityInCart(
  dispatch: AppDispatch,
  input: { slug: string; quantity: number },
) {
  const cart = await updateCartLine(input.slug, { quantity: input.quantity });
  syncCart(dispatch, cart);
}

export async function removeProductFromCart(
  dispatch: AppDispatch,
  productSlug: string,
) {
  const cart = await removeCartLine(productSlug);
  syncCart(dispatch, cart);
}

export async function clearCartItems(dispatch: AppDispatch) {
  const cart = await clearCart();
  syncCart(dispatch, cart);
}

export async function initializeGuestCart(dispatch: AppDispatch) {
  const cart = await fetchCurrentCart();
  if (cart) {
    dispatch(setCartFromServer(cartToViewItems(cart)));
    return cart;
  }

  const created = await createCart();
  dispatch(setCartFromServer([]));
  return created;
}
