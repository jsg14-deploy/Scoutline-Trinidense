"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActionState, useEffect } from "react";
import { Plus, X, UserPlus, Loader2 } from "lucide-react";
import { createSquadPlayer } from "@/app/actions/squad";

export function AddPlayerModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createSquadPlayer, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-navy-deep hover:opacity-90 transition-opacity"
      >
        <UserPlus size={15} />
        Agregar jugador
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                    <UserPlus size={16} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text">Nuevo Jugador</h2>
                    <p className="text-xs text-muted">Agrega un jugador al plantel principal</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted hover:text-text hover:bg-card transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form ref={formRef} action={formAction} className="p-5 grid gap-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 grid gap-1">
                    <label htmlFor="add-name" className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Nombre completo *
                    </label>
                    <input
                      id="add-name" name="name" required
                      placeholder="Ej: Jonathan Santana"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="add-positionGroup" className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Posición *
                    </label>
                    <select
                      id="add-positionGroup" name="positionGroup" required
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="GK">Arquero</option>
                      <option value="DEF">Defensor</option>
                      <option value="MID">Mediocampista</option>
                      <option value="FWD">Delantero</option>
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="add-nationality" className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Nacionalidad
                    </label>
                    <input
                      id="add-nationality" name="nationality"
                      placeholder="Paraguay"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="grid gap-1">
                    <label htmlFor="add-shirtNumber" className="text-xs font-semibold text-muted uppercase tracking-wider">Nro.</label>
                    <input id="add-shirtNumber" name="shirtNumber" type="number" min="1" max="99" placeholder="10"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="add-heightCm" className="text-xs font-semibold text-muted uppercase tracking-wider">Altura</label>
                    <input id="add-heightCm" name="heightCm" type="number" min="140" max="220" placeholder="181"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="add-weightKg" className="text-xs font-semibold text-muted uppercase tracking-wider">Peso</label>
                    <input id="add-weightKg" name="weightKg" type="number" min="50" max="130" placeholder="78"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="add-foot" className="text-xs font-semibold text-muted uppercase tracking-wider">Pie</label>
                    <select id="add-foot" name="foot"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none">
                      <option value="">—</option>
                      <option value="Derecho">Derecho</option>
                      <option value="Izquierdo">Izquierdo</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <label htmlFor="add-dateOfBirth" className="text-xs font-semibold text-muted uppercase tracking-wider">Fecha de nacimiento</label>
                    <input id="add-dateOfBirth" name="dateOfBirth" type="date"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="add-contractExpiry" className="text-xs font-semibold text-muted uppercase tracking-wider">Venc. contrato</label>
                    <input id="add-contractExpiry" name="contractExpiry" type="date"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none" />
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-1">
                  <label htmlFor="add-notes" className="text-xs font-semibold text-muted uppercase tracking-wider">Observaciones</label>
                  <textarea id="add-notes" name="notes" rows={2} placeholder="Capitán del equipo, referente..."
                    className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none resize-none transition-colors" />
                </div>

                {/* Error */}
                {state?.error && (
                  <p className="text-sm text-negative bg-negative/10 rounded-lg px-3 py-2">{state.error}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {pending ? "Registrando..." : "Registrar jugador"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
