-- CreateTable
CREATE TABLE "PlayerSalary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "monthlySalary" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerSalary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerSalary_tenantId_season_idx" ON "PlayerSalary"("tenantId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSalary_tenantId_playerId_season_key" ON "PlayerSalary"("tenantId", "playerId", "season");

-- AddForeignKey
ALTER TABLE "PlayerSalary" ADD CONSTRAINT "PlayerSalary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSalary" ADD CONSTRAINT "PlayerSalary_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
