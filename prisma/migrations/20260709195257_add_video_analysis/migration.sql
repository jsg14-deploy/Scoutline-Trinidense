-- CreateTable
CREATE TABLE "VideoClip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "playerId" TEXT,
    "aiAnalysis" TEXT,
    "aiAnalyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAnnotation" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "timestampSeconds" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoAnnotation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoClip" ADD CONSTRAINT "VideoClip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoClip" ADD CONSTRAINT "VideoClip_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnnotation" ADD CONSTRAINT "VideoAnnotation_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "VideoClip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
