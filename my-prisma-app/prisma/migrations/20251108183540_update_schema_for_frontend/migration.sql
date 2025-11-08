/*
  Warnings:

  - The values [dibatalkan] on the enum `DepositStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [dibatalkan] on the enum `WithdrawalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Deposit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `walletNumber` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Withdrawal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kategori` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DepositStatus_new" AS ENUM ('pending', 'validated', 'cancelled');
ALTER TABLE "public"."Deposit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Deposit" ALTER COLUMN "status" TYPE "DepositStatus_new" USING ("status"::text::"DepositStatus_new");
ALTER TYPE "DepositStatus" RENAME TO "DepositStatus_old";
ALTER TYPE "DepositStatus_new" RENAME TO "DepositStatus";
DROP TYPE "public"."DepositStatus_old";
ALTER TABLE "Deposit" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WithdrawalStatus_new" AS ENUM ('pending', 'processing', 'completed', 'cancelled');
ALTER TABLE "public"."Withdrawal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Withdrawal" ALTER COLUMN "status" TYPE "WithdrawalStatus_new" USING ("status"::text::"WithdrawalStatus_new");
ALTER TYPE "WithdrawalStatus" RENAME TO "WithdrawalStatus_old";
ALTER TYPE "WithdrawalStatus_new" RENAME TO "WithdrawalStatus";
DROP TYPE "public"."WithdrawalStatus_old";
ALTER TABLE "Withdrawal" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "Deposit" DROP CONSTRAINT "Deposit_pkey",
ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Deposit_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "walletNumber",
ADD COLUMN     "coinExchanged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "coinRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ewallet" TEXT,
ADD COLUMN     "ewalletNumber" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Withdrawal_id_seq";

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
