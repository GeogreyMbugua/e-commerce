import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type CartItem = {
  id: number;
  slug: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
    alts?: string[];
  };
  imageAlt?: string;
  primaryImageUrl?: string;
};

type InitialState = {
  items: CartItem[];
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromServer: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.slug !== action.payload);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ slug: string; quantity: number }>,
    ) => {
      const { slug, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.slug === slug);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

export const {
  setCartFromServer,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
