-- AlterEnum
ALTER TYPE "AlertStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "publishAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Alert_status_publishAt_idx" ON "Alert"("status", "publishAt");
