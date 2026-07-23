import { UploadCloud } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DataUploader } from "@/components/data/DataUploader";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TrashManager } from "@/components/data/TrashManager";

export const maxDuration = 60;

export default async function DataPage() {
  const session = await requireSession();

  const [recentUploads, deletedPlayers] = await Promise.all([
    prisma.dataUploadSession.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.player.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        name: true,
        positionGroup: true,
        nationality: true,
        deletedAt: true,
      },
    }),
  ]);

  const serializedDeleted = deletedPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    positionGroup: p.positionGroup,
    nationality: p.nationality,
    deletedAt: p.deletedAt!.toISOString(),
  }));

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={UploadCloud}
        eyebrow="Gestión & Ingesta"
        title="Gestión de Datos"
        subtitle="Subí exports SICS/GPS, administrá la papelera de reciclaje y optimizá la base de datos."
      />

      <DataUploader />

      <TrashManager deletedPlayers={serializedDeleted} />

      <div>
        <h2 className="mb-3 text-sm font-bold text-text">Historial de cargas de datos (GPS/SICS)</h2>
        {recentUploads.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay cargas de datos en el sistema.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {["Tipo", "Referencia", "Fecha Sesión", "Archivo Fuente", "Fecha Carga"].map((h) => (
                    <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="p-3 text-xs">
                      <span className="rounded-full bg-accent/20 px-2.5 py-0.5 font-semibold text-accent border border-accent/30">
                        {u.kind === "physical" ? "Físico GPS" : u.kind === "match_events" ? "Eventos SICS" : "Reporte"}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-medium text-text">{u.playerRef}</td>
                    <td className="p-3 text-xs text-muted font-mono">{u.sessionDate.toISOString().slice(0, 10)}</td>
                    <td className="p-3 text-xs text-muted">{u.sourceFilename ?? "—"}</td>
                    <td className="p-3 text-xs text-muted font-mono">{u.createdAt.toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
