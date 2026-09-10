-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'UNAVAILABLE';
ALTER TYPE "ProductStatus" ADD VALUE 'SOLD';

-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "sku" TEXT,
ADD COLUMN "brand" TEXT,
ADD COLUMN "model" TEXT,
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Customer
ALTER TABLE "Customer" ADD COLUMN "role" "CustomerRole" NOT NULL DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Category_isActive_name_idx" ON "Category"("isActive", "name");
CREATE INDEX "Product_isFeatured_status_createdAt_idx" ON "Product"("isFeatured", "status", "createdAt");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Customer_role_idx" ON "Customer"("role");
