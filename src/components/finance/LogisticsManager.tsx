"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Hotel, Bus, Calendar, Trash2 } from "lucide-react";
import { createLogistics, deleteLogistics } from "@/app/actions/finance";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";

type LogisticsItem = {
  id: string;
  hotelCost: number;
  busCost: number;
  date: Date;
  notes: string | null;
  isPublic: boolean;
};

interface LogisticsManagerProps {
  logistics: LogisticsItem[];
}

export function LogisticsManager({ logistics }: LogisticsManagerProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [state, formAction, pending] = useActionState(createLogistics, undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined && !pending) {
      formRef.current?.reset();
      setIsPublic(true);
    }
  }, [state, pending]);

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
            Cargar Gasto Logística
          </h3>

          <div className="grid gap-1">
            <label htmlFor="hotelCost" className="text-xs font-semibold text-muted">
              Costo de Hotel *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted">Gs/USD</span>
              <input
                id="hotelCost"
                name="hotelCost"
                type="number"
                required
                placeholder="Ej: 3500000"
                className="w-full rounded-lg border border-border bg-surface pl-16 pr-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="busCost" className="text-xs font-semibold text-muted">
              Costo de Micro / Traslado *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted">Gs/USD</span>
              <input
                id="busCost"
                name="busCost"
                type="number"
                required
                placeholder="Ej: 1500000"
                className="w-full rounded-lg border border-border bg-surface pl-16 pr-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="date" className="text-xs font-semibold text-muted">
              Fecha de concentración
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="notes" className="text-xs font-semibold text-muted">
              Notas / Observaciones
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Ej: Concentración en Hotel Asunción para el partido vs Olimpia."
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Registrar Logística"}
          </button>
        </form>
      </div>

      {/* Listado */}
      <div className="md:col-span-2 grid gap-3 content-start">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7] border-b border-border pb-1">
          Historial de Concentraciones ({logistics.length})
        </h3>

        {logistics.length === 0 ? (
          <p className="text-sm text-muted italic p-4 rounded-xl border border-dashed border-border-2 text-center bg-card">
            No hay gastos de logística registrados en esta sesión.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-xs font-semibold text-muted">
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Hotel</th>
                  <th className="p-3 text-left">Micro</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Notas</th>
                  <th className="p-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {logistics.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-b-0 hover:bg-surface text-sm">
                    <td className="p-3 font-medium text-text">{l.date.toISOString().slice(0, 10)}</td>
                    <td className="p-3 text-muted font-mono">{Math.round(l.hotelCost).toLocaleString("es-PY")}</td>
                    <td className="p-3 text-muted font-mono">{Math.round(l.busCost).toLocaleString("es-PY")}</td>
                    <td className="p-3 font-semibold font-mono text-text">
                      {Math.round(l.hotelCost + l.busCost).toLocaleString("es-PY")}
                    </td>
                    <td className="p-3 text-xs text-muted max-w-[200px] truncate" title={l.notes ?? ""}>
                      {l.notes ?? "—"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm("¿Estás seguro de que querés eliminar este registro?")) {
                            startTransition(() => deleteLogistics(l.id));
                          }
                        }}
                        disabled={isPending}
                        title="Eliminar"
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative disabled:opacity-50"
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
