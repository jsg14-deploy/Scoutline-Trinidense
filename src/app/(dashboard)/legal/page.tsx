import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Scale, AlertTriangle, FileSignature } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ContractForm } from "./ContractForm";
import { AiLegalAnalyzer } from "@/components/legal/AiLegalAnalyzer";
import { deleteLegalContract } from "@/app/actions/legal";

export default async function LegalPage() {
  const session = await requireSession();

  const [contracts, players] = await Promise.all([
    prisma.legalContract.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { endDate: "asc" },
      include: { player: true },
    }),
    prisma.player.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  const now = new Date();
  const getDaysRemaining = (endDate: Date) => {
    return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const criticalContracts = contracts.filter(c => getDaysRemaining(c.endDate) <= 30 && c.status === "active");
  const warningContracts = contracts.filter(c => getDaysRemaining(c.endDate) > 30 && getDaysRemaining(c.endDate) <= 90 && c.status === "active");

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Scale}
        eyebrow="Departamento Legal"
        title="Gestión de Contratos"
        subtitle="Control de vencimientos patrimoniales, cláusulas y acuerdos comerciales."
      />

      {/* Alertas */}
      {(criticalContracts.length > 0 || warningContracts.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {criticalContracts.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-negative/10 p-4 border border-negative/20">
              <AlertTriangle className="text-negative mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-negative">Riesgo Crítico</h4>
                <p className="text-xs text-negative/80 font-medium">Hay {criticalContracts.length} contrato(s) venciendo en menos de 30 días.</p>
              </div>
            </div>
          )}
          {warningContracts.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-accent/10 p-4 border border-accent/20">
              <AlertTriangle className="text-accent mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-accent">Atención Próxima</h4>
                <p className="text-xs text-accent/80 font-medium">Hay {warningContracts.length} contrato(s) venciendo en los próximos 90 días.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="p-4 font-semibold text-muted">Título / Titular</th>
                  <th className="p-4 font-semibold text-muted">Tipo</th>
                  <th className="p-4 font-semibold text-muted">Vigencia</th>
                  <th className="p-4 font-semibold text-muted text-right">Vencimiento</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted">
                      <FileSignature size={24} className="mx-auto mb-2 opacity-50" />
                      No hay contratos registrados.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => {
                    const days = getDaysRemaining(c.endDate);
                    const isCritical = days <= 30;
                    const isWarning = days > 30 && days <= 90;
                    const isExpired = days < 0;

                    return (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors tabular-nums">
                        <td className="p-4">
                          <p className="font-medium text-text">{c.title}</p>
                          {c.player && <p className="text-xs text-muted mt-0.5">{c.player.name}</p>}
                        </td>
                        <td className="p-4 text-muted text-xs font-semibold uppercase tracking-wider">{c.type}</td>
                        <td className="p-4 text-xs text-muted whitespace-nowrap">
                          {c.startDate.toLocaleDateString("es-PY")} - {c.endDate.toLocaleDateString("es-PY")}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            isExpired ? "bg-surface border border-border text-muted" :
                            isCritical ? "bg-negative text-white" : 
                            isWarning ? "bg-accent/20 text-accent" : "bg-positive/20 text-positive"
                          }`}>
                            {isExpired ? "Vencido" : `${days} días`}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <form action={deleteLegalContract.bind(null, c.id)}>
                            <button className="text-muted hover:text-negative transition-colors">Eliminar</button>
                          </form>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AiLegalAnalyzer />
        </div>

        <div className="flex flex-col gap-6">
          <ContractForm players={players} />
        </div>
      </div>
    </div>
  );
}
