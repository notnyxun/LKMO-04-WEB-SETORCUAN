-- AlterEnum
ALTER TYPE "DepositStatus" ADD VALUE 'dibatalkan';

-- AlterEnum
ALTER TYPE "WithdrawalStatus" ADD VALUE 'dibatalkan';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalCoins" INTEGER NOT NULL DEFAULT 0;
