/*
  Warnings:

  - The primary key for the `Budget` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `month` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Budget` table. All the data in the column will be lost.
  - The `id` column on the `Budget` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropIndex
DROP INDEX "Budget_categoryId_month_year_key";

-- AlterTable
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_pkey",
DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ADD CONSTRAINT "Budget_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
