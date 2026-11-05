-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationName" VARCHAR(120),
ADD COLUMN     "longitude" DOUBLE PRECISION;
