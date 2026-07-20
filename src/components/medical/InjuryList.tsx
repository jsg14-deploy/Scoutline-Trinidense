"use client";

import { useTransition } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { deleteInjury, markInjuryRecovered } from "@/app/actions/medical";
import type { InjurySeverity, InjuryStatus } from "@/generated/prisma/enums";

export type InjuryRow = {
  id: string;
  diagnosis: string;
  bodyPart: string;
  severity: InjurySeverity;
  status: InjuryStatus;
  occurredAt: string;
  expectedReturnAt: string | null;
  actualReturnAt: string | null;
  notes: string | null;
};

const SEVERITY_LABEL: Record<InjurySeverity, string> = { mild: "Leve", moderate: "Moderada", severe: "Grave" };
const SEVERITY_COLOR: Record<InjurySeverity, string> = {
  mild: "text-positive",
  moderate: "text-warn",
  severe: "text-negative",
};
const STATUS_LABEL: Record<InjuryStatus, string> = {
  active: "Activa",
  recovering: "En recuperación",
  recovered: "Recuperado",
};

export function InjuryList({ playerId, injuries }: { playerId: string; injuries: InjuryRow[] }) {
  const [pending, startTransition] = useTransition();

  if (injuries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-2 bg-card p-6 text-center text-sm text-muted">
        Todavía no hay lesiones registradas para este jugador.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {injuries.map((inj) => (
        <div key={inj.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-text">
                {inj.diagnosis} · <span className="font-normal text-muted">{inj.bodyPart}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                <span className={SEVERITY_COLOR[inj.severity]}>{SEVERITY_LABEL[inj.severity]}</span>
                {" · "}
                {inj.status === "recovered" ? (
                  <span className="text-positive">{STATUS_LABEL[inj.status]}</span>
                ) : (
                  <span className="text-warn">{STATUS_LABEL[inj.status]}</span>
                )}
                {" · desde "}
                {inj.occurredAt.slice(0, 10)}
                {inj.expectedReturnAt && !inj.actualReturnAt && ` · retorno estimado ${inj.expectedReturnAt.slice(0, 10)}`}
                {inj.actualReturnAt && ` · retornó ${inj.actualReturnAt.slice(0, 10)}`}
              </p>
              {inj.notes && <p className="mt-1.5 text-xs text-muted">{inj.notes}</p>}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {inj.status !== "recovered" && (
                <button
                  type="button"
                  title="Marcar como recuperado"
                  disabled={pending}
                  onClick={() => startTransition(() => markInjuryRecovered(inj.id, playerId))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-positive hover:border-positive disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                </button>
              )}
              <button
                type="button"
                title="Eliminar"
                disabled={pending}
                onClick={() => startTransition(() => deleteInjury(inj.id, playerId))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
