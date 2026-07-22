"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { DollarSign, ShieldAlert, CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { createFine, toggleFineStatus, deleteFine } from "@/app/actions/finance";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";

type FineItem = {
  id: string;
  player: { name: string };
  amount: number;
  reason: string;
  date: Date;
  status: string;
  isPublic: boolean;
};

interface FineManagerProps {
  fines: FineItem[];
  players: { id: string; name: string }[];
}

export function FineManager({ fines, players }: FineManagerProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [state, formAction, pending] = useActionState(createFine, undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined && !pending) {
      formRef.current?.reset();
      setIsPublic(true);
    }
  }, [state, pending]);

  function getStatusBadge(status: string) {
    if (status === "paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-positive/15 px-2.5 py-0.5 text-xs font-semibold text-positive">
          Pagada
        </span>
      );
    }
    if (status === "deducted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
          Descontada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-negative/15 px-2.5 py-0.5 text-xs font-semibold text-negative">
        Pendiente
      </span>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Formulario */}
      <div className="md:col-span-1">
        <form
          ref={formRef}
          action={formAction}
          className="grid gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-bold text-text uppercase tracking-wider text-[#f2c230] border-b border-border pb-1">
            Cargar Multa
          </h3>

          <div className="grid gap-1">
            <label htmlFor="playerId" className="text-xs font-semibold text-muted">
              Jugador *
            </label>
            <select
              id="playerId"
              name="playerId"
              required
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            >
              <option value="">Seleccioná un jugador</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="amount" className="text-xs font-semibold text-muted">
              Monto (Gs / USD) *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              required
              placeholder="Ej: 500000"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="reason" className="text-xs font-semibold text-muted">
              Motivo / Razón *
            </label>
            <input
              id="reason"
              name="reason"
              required
              placeholder="Ej: Llegada tarde al entrenamiento"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="date" className="text-xs font-semibold text-muted">
              Fecha
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Registrar Multa"}
          </button>
        </form>
      </div>

      {/* Listado */}
      <div className="md:col-span-2 grid gap-3 content-start">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7] border-b border-border pb-1">
          Multas Registradas ({fines.length})
        </h3>

        {fines.length === 0 ? (
          <p className="text-sm text-muted italic p-4 rounded-xl border border-dashed border-border-2 text-center bg-card">
            No hay multas registradas en esta sesión.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs font-semibold text-muted">
                  <th className="p-3 text-left">Jugador</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Motivo</th>
                  <th className="p-3 text-left">Monto</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-b-0 hover:bg-surface text-sm">
                    <td className="p-3 font-semibold text-text">{f.player.name}</td>
                    <td className="p-3 text-muted">{f.date.toISOString().slice(0, 10)}</td>
                    <td className="p-3 text-muted">{f.reason}</td>
                    <td className="p-3 font-mono font-semibold text-text">
                      {Math.round(f.amount).toLocaleString("es-PY")}
                    </td>
                    <td className="p-3">{getStatusBadge(f.status)}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => startTransition(() => toggleFineStatus(f.id, f.status))}
                        disabled={isPending}
                        title="Cambiar estado de multa"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Estás seguro de que querés eliminar esta multa?")) {
                            startTransition(() => deleteFine(f.id));
                          }
                        }}
                        disabled={isPending}
                        title="Eliminar"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
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
