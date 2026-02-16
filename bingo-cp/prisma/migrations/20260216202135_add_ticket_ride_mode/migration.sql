-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."MatchMode" ADD VALUE 'tug';
ALTER TYPE "public"."MatchMode" ADD VALUE 'ticket_ride';

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "mapType" TEXT,
ADD COLUMN     "problemLevels" JSONB,
ADD COLUMN     "routeCards" JSONB,
ADD COLUMN     "stationsData" JSONB,
ADD COLUMN     "tracksData" JSONB,
ADD COLUMN     "tugCount" INTEGER,
ADD COLUMN     "tugThreshold" INTEGER,
ADD COLUMN     "tugType" TEXT;

-- AlterTable
ALTER TABLE "public"."Team" ADD COLUMN     "coins" INTEGER DEFAULT 0,
ADD COLUMN     "stationsUsed" INTEGER DEFAULT 0,
ADD COLUMN     "trackPoints" INTEGER DEFAULT 0,
ADD COLUMN     "tracksUsed" INTEGER DEFAULT 0;
