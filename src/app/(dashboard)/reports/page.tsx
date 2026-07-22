import Link from "next/link";
import { Download, FileText, Trash2, EyeOff } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PdfUploader } from "@/components/reports/PdfUploader";
import { deleteReport } from "@/app/actions/reports";

export default async function ReportsPage() {
  const session = await requireSession();

  const [players, recentReports, allPlayersForSelect] = await Promise.all([
    prisma.player.findMany({
      where: { seasonStats: { some: {} } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, positionGroup: true, currentTeam: { select: { name: true } } },
      take: 200,
    }),
    prisma.report.findMany({
      where: {
        tenantId: session.tenantId,
        OR: [
          { isPublic: true },
          { createdById: session.userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.player.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 300,
    }),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={FileText}
        eyebrow="Exportables"
        title="Reportes"
        subtitle="Generá informes de scouting en PDF por jugador o subí tus propios PDFs tácticos."
      />

      {/* Cargar PDF */}
      <PdfUploader players={allPlayersForSelect} />

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-2 bg-card p-16 text-center">
          <FileText size={28} className="text-muted" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-text">Todavía no hay jugadores con datos</p>
          <p className="max-w-sm text-sm text-muted">
            Subí un export de SICS desde <span className="text-accent">Datos</span> para poder generar informes.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7] border-b border-border pb-1">
            Generar informe desde catálogo de Scouting
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {["Jugador", "Posición", "Equipo", ""].map((h) => (
                    <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                    <td className="p-3">
                      <Link href={`/players/${p.id}`} className="font-medium text-text hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-3 text-xs text-muted">{p.positionGroup}</td>
                    <td className="p-3 text-xs text-muted">{p.currentTeam?.name ?? "—"}</td>
                    <td className="p-3 text-right">
                      <a
                        href={`/api/reports/player/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent"
                      >
                        <Download size={12} />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7] border-b border-border pb-1">
          Historial de Reportes generados y subidos
        </h2>
        {recentReports.length === 0 ? (
          <p className="text-sm text-muted">Todavía no generaste ni subiste ningún reporte.</p>
        ) : (
          <ul className="grid gap-2">
            {recentReports.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-text font-medium">{r.title}</span>
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent capitalize">
                    {r.kind === "uploaded_pdf" ? "PDF Subido" : "Autogenerado"}
                  </span>
                  {!r.isPublic && (
                    <span className="flex items-center gap-0.5 text-[10px] text-warn font-semibold bg-warn/15 px-1.5 py-0.5 rounded">
                      <EyeOff size={10} /> Privado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted mr-2">
                    {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                  {r.kind === "uploaded_pdf" && (
                    <a
                      href={`/api/reports/download/${r.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-accent hover:text-accent"
                      title="Descargar PDF"
                    >
                      <Download size={12} />
                    </a>
                  )}
                  <form action={deleteReport.bind(null, r.id)}>
                    <button
                      type="submit"
                      title="Eliminar reporte"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative"
                    >
                      <Trash2 size={12} />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
