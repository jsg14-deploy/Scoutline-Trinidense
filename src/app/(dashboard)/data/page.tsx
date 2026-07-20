import { UploadCloud } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DataUploader } from "@/components/data/DataUploader";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Los archivos de SICS pueden traer cientos de filas, cada una con varias
// idas y vueltas a la base — el default de Vercel se queda corto para eso.
export const maxDuration = 60;

export default async function DataPage() {
  const session = await requireSession();
  const recentUploads = await prisma.dataUploadSession.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={UploadCloud}
        eyebrow="Ingesta"
        title="Datos"
        subtitle="Subí exports de SICS o de GPS para alimentar el motor de similitud."
      />

      <DataUploader />

      <div>
        <h2 className="mb-3 text-sm font-bold text-text">Cargas recientes</h2>
        {recentUploads.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay cargas de datos.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {["Tipo", "Referencia", "Fecha", "Archivo", "Cargado"].map((h) => (
                    <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="p-3 text-xs">
                      <span className="rounded-full bg-accent/25 px-2 py-0.5 font-semibold text-text">
                        {u.kind === "physical" ? "Físico" : u.kind === "match_events" ? "Eventos" : "Reporte"}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-medium text-text">{u.playerRef}</td>
                    <td className="p-3 text-xs text-muted">{u.sessionDate.toISOString().slice(0, 10)}</td>
                    <td className="p-3 text-xs text-muted">{u.sourceFilename ?? "—"}</td>
                    <td className="p-3 text-xs text-muted">{u.createdAt.toISOString().slice(0, 10)}</td>
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
