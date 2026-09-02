"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(
  undefined,
);

export const useCartModalContext = () => {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error("useCartModalContext must be used within a CartModalProvider");
  }
  return context;
};

export const CartModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const openCartModal = useCallback(() => {
    setIsCartModalOpen(true);
  }, []);

  const closeCartModal = useCallback(() => {
    setIsCartModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isCartModalOpen, openCartModal, closeCartModal }),
    [isCartModalOpen, openCartModal, closeCartModal],
  );

  return (
    <CartModalContext.Provider value={value}>{children}</CartModalContext.Provider>
  );
};
