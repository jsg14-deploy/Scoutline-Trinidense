-- CreateEnum
CREATE TYPE "InjurySeverity" AS ENUM ('mild', 'moderate', 'severe');

-- CreateEnum
CREATE TYPE "InjuryStatus" AS ENUM ('active', 'recovering', 'recovered');

-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "severity" "InjurySeverity" NOT NULL DEFAULT 'moderate',
    "status" "InjuryStatus" NOT NULL DEFAULT 'active',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "expectedReturnAt" TIMESTAMP(3),
    "actualReturnAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinfoldMeasurement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "tricepsMm" DOUBLE PRECISION,
    "subscapularMm" DOUBLE PRECISION,
    "suprailiacMm" DOUBLE PRECISION,
    "abdominalMm" DOUBLE PRECISION,
    "thighMm" DOUBLE PRECISION,
    "calfMm" DOUBLE PRECISION,
    "sumMm" DOUBLE PRECISION NOT NULL,
    "bodyFatPercent" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkinfoldMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Injury_tenantId_playerId_idx" ON "Injury"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "SkinfoldMeasurement_tenantId_playerId_idx" ON "SkinfoldMeasurement"("tenantId", "playerId");

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinfoldMeasurement" ADD CONSTRAINT "SkinfoldMeasurement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinfoldMeasurement" ADD CONSTRAINT "SkinfoldMeasurement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
