type InventoryLike = {
  quantityAvailable: number;
  quantityReserved: number;
};

export const getSellableQuantity = (inventory: InventoryLike | null | undefined) => {
  if (!inventory) {
    return 0;
  }

  return Math.max(0, inventory.quantityAvailable - inventory.quantityReserved);
};

export const hasSellableQuantity = (
  inventory: InventoryLike | null | undefined,
  requestedQuantity: number,
) => getSellableQuantity(inventory) >= requestedQuantity;
