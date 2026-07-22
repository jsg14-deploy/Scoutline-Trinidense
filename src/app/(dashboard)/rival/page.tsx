import { Swords } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RivalContainer } from "@/components/rival/RivalContainer";

export default async function RivalPage() {
  const session = await requireSession();

  // Cargamos los análisis de rivales de este tenant respetando privacidad
  const analyses = await prisma.opponentAnalysis.findMany({
    where: {
      tenantId: session.tenantId,
      OR: [
        { isPublic: true },
        { createdById: session.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={Swords}
        eyebrow="Análisis táctico"
        title="Análisis del Rival"
        subtitle="Analizá formaciones, minutos, convocados del rival y generá reportes con IA para planificar el partido."
      />

      <RivalContainer analyses={analyses} userId={session.userId} />
    </div>
  );
}
