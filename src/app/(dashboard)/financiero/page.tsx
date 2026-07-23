import { DollarSign } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SalaryUploader } from "@/components/finance/SalaryUploader";
import { SalaryManualForm } from "@/components/finance/SalaryManualForm";
import { SalaryTable } from "@/components/finance/SalaryTable";
import { FinanceRankingChart } from "@/components/finance/FinanceRankingChart";
import { FinanceCompare } from "@/components/finance/FinanceCompare";
import { FinanceAiAssistant } from "@/components/finance/FinanceAiAssistant";
import { FineManager } from "@/components/finance/FineManager";
import { loadSalaryRows } from "@/lib/finance/loadSalaryRows";

export default async function FinancieroPage() {
  const session = await requireSession();

  const [rows, players, fines] = await Promise.all([
    loadSalaryRows(session.tenantId, session.userId),
    prisma.player.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true }, take: 300 }),
    prisma.fine.findMany({
      where: {
        tenantId: session.tenantId,
        OR: [{ isPublic: true }, { createdById: session.userId }],
      },
      include: { player: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalSeasonCost = rows.reduce((sum, r) => sum + r.seasonCost, 0);
  const withCost = rows.filter((r) => r.costPerMinute !== null);
  const avgCostPerMinute =
    withCost.length > 0 ? withCost.reduce((sum, r) => sum + (r.costPerMinute ?? 0), 0) / withCost.length : null;

  const finesMapped = fines.map((f) => ({
    id: f.id,
    player: f.player,
    amount: Number(f.amount),
    reason: f.reason,
    date: f.date,
    status: f.status,
    isPublic: f.isPublic,
  }));

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={DollarSign}
        eyebrow="Departamento financiero"
        title="Financiero"
        subtitle="Costo salarial por jugador y por minuto jugado, además de multas y logística."
      />

      {rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Jugadores con salario cargado" value={String(rows.length)} />
          <SummaryCard label="Costo total de temporada" value={Math.round(totalSeasonCost).toLocaleString("es-PY")} />
          <SummaryCard
            label="Costo/minuto promedio (con minutos)"
            value={avgCostPerMinute !== null ? Math.round(avgCostPerMinute).toLocaleString("es-PY") : "—"}
          />
        </div>
      )}

      {/* Salarios */}
      <div className="grid gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#f2c230] border-b border-border pb-1">Cargar y Ver Salarios</h2>
        <SalaryUploader />
        <SalaryManualForm players={players} />
        <SalaryTable rows={rows} />
      </div>

      {/* Multas */}
      <div className="grid gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#f2c230] border-b border-border pb-1">Gestión de Multas</h2>
        <FineManager fines={finesMapped} players={players} />
      </div>

      <FinanceRankingChart rows={rows} />
      <FinanceCompare rows={rows} />
      <FinanceAiAssistant />

      <p className="text-[11px] text-muted-2">
        El costo de temporada se estima como salario mensual × 12 (contrato de año completo). El costo por minuto
        solo se calcula para temporadas en las que el jugador ya tiene minutos jugados cargados (vía SICS en
        Datos).
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-black text-text">{value}</p>
    </div>
  );
}
