import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function ReportsPage() {
  const session = await requireSession();

  const [players, recentReports] = await Promise.all([
    prisma.player.findMany({
      where: { seasonStats: { some: {} } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, positionGroup: true, currentTeam: { select: { name: true } } },
      take: 200,
    }),
    prisma.report.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={FileText}
        eyebrow="Exportables"
        title="Reportes"
        subtitle="Descargá informes de scouting en PDF por jugador."
      />

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-2 bg-card p-16 text-center">
          <FileText size={28} className="text-muted" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-text">Todavía no hay jugadores con datos</p>
          <p className="max-w-sm text-sm text-muted">
            Subí un export de SICS desde <span className="text-accent">Datos</span> para poder generar informes.
          </p>
        </div>
      ) : (
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
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold text-text">Reportes generados recientemente</h2>
        {recentReports.length === 0 ? (
          <p className="text-sm text-muted">Todavía no generaste ningún reporte.</p>
        ) : (
          <ul className="grid gap-2">
            {recentReports.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="text-text">{r.title}</span>
                <span className="text-xs text-muted">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
