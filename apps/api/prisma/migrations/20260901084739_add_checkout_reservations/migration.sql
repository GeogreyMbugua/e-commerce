-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('OPEN', 'EXPIRED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED', 'CONVERTED');

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'OPEN',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "email" TEXT,
    "shippingMethod" TEXT NOT NULL DEFAULT 'standard',
    "subtotalMinor" INTEGER NOT NULL,
    "shippingMinor" INTEGER NOT NULL,
    "taxMinor" INTEGER NOT NULL DEFAULT 0,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSessionLine" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "conditionGrade" "ConditionGrade" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceMinor" INTEGER NOT NULL,
    "lineTotalMinor" INTEGER NOT NULL,

    CONSTRAINT "CheckoutSessionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReservation" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_guestToken_key" ON "CheckoutSession"("guestToken");

-- CreateIndex
CREATE INDEX "CheckoutSession_cartId_status_idx" ON "CheckoutSession"("cartId", "status");

-- CreateIndex
CREATE INDEX "CheckoutSession_expiresAt_status_idx" ON "CheckoutSession"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "CheckoutSessionLine_checkoutSessionId_idx" ON "CheckoutSessionLine"("checkoutSessionId");

-- CreateIndex
CREATE INDEX "InventoryReservation_inventoryItemId_status_idx" ON "InventoryReservation"("inventoryItemId", "status");

-- CreateIndex
CREATE INDEX "InventoryReservation_expiresAt_status_idx" ON "InventoryReservation"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "InventoryReservation_checkoutSessionId_status_idx" ON "InventoryReservation"("checkoutSessionId", "status");

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSessionLine" ADD CONSTRAINT "CheckoutSessionLine_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSessionLine" ADD CONSTRAINT "CheckoutSessionLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
