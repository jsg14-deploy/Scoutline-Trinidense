import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { isProviderConfigured, PROVIDER_LABELS, type AiProvider } from "@/lib/ai/providers";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function AssistantPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, positionGroup: true },
    take: 200,
  });

  const providers = (Object.keys(PROVIDER_LABELS) as AiProvider[]).map((provider) => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
    configured: isProviderConfigured(provider),
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Sparkles}
        eyebrow="Copiloto"
        title="Asistente IA"
        subtitle="Elegí un modelo y, si querés, un jugador de tu catálogo para darle contexto a la conversación."
      />

      <AssistantChat providers={providers} players={players} />
    </div>
  );
}
