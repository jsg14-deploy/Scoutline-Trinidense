"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, AlertTriangle, CheckCircle, Flame, Users } from "lucide-react";
import { restoreSquadPlayer, permanentlyDeleteSquadPlayer, emptyTrash } from "@/app/actions/squad";

type DeletedPlayer = {
  id: string;
  name: string;
  positionGroup: string;
  nationality: string | null;
  deletedAt: string;
};

export function TrashManager({ deletedPlayers }: { deletedPlayers: DeletedPlayer[] }) {
  const [items, setItems] = useState(deletedPlayers);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleRestore(id: string) {
    startTransition(async () => {
      const res = await restoreSquadPlayer(id);
      if (res?.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        setMessage("Jugador restaurado al plantel.");
      }
    });
  }

  function handleDeletePermanent(id: string) {
    startTransition(async () => {
      const res = await permanentlyDeleteSquadPlayer(id);
      if (res?.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        setMessage("Jugador eliminado definitivamente.");
      }
    });
  }

  function handleEmptyTrash() {
    if (!confirm("¿Estás seguro de vaciar la papelera? Todos los jugadores aquí se eliminarán de forma permanente.")) return;
    startTransition(async () => {
      const res = await emptyTrash();
      if (res?.success) {
        setItems([]);
        setMessage("La papelera ha sido vaciada.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-negative/10 border border-negative/20">
            <Trash2 size={18} className="text-negative" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Papelera de Reciclaje</h3>
            <p className="text-xs text-muted">Restaurá jugadores eliminados o removelos definitivamente</p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-negative/30 bg-negative/10 px-3 py-1.5 text-xs font-semibold text-negative hover:bg-negative/20 transition-colors disabled:opacity-50"
          >
            <Flame size={13} />
            Vaciar papelera ({items.length})
          </button>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-positive/10 border border-positive/20 px-3.5 py-2 text-xs font-semibold text-positive">
          <CheckCircle size={14} />
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <CheckCircle size={28} className="text-muted/40" />
          <p className="text-sm font-semibold text-text">La papelera está vacía</p>
          <p className="text-xs text-muted">Los jugadores que elimines del plantel aparecerán aquí antes de ser borrados definitivamente.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-card text-left">
                <th className="p-3 font-semibold text-muted">Jugador</th>
                <th className="p-3 font-semibold text-muted">Posición</th>
                <th className="p-3 font-semibold text-muted">Nacionalidad</th>
                <th className="p-3 font-semibold text-muted">Eliminado el</th>
                <th className="p-3 text-right font-semibold text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-border last:border-0 hover:bg-card/50 transition-colors"
                >
                  <td className="p-3 font-bold text-text">{p.name}</td>
                  <td className="p-3 text-muted">{p.positionGroup}</td>
                  <td className="p-3 text-muted">{p.nationality ?? "—"}</td>
                  <td className="p-3 text-muted font-mono">
                    {new Date(p.deletedAt).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleRestore(p.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-md bg-accent/10 border border-accent/20 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                      title="Restaurar al plantel"
                    >
                      <RotateCcw size={12} />
                      Restaurar
                    </button>
                    <button
                      onClick={() => handleDeletePermanent(p.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-md border border-negative/30 px-2.5 py-1 text-xs font-semibold text-negative hover:bg-negative/10 transition-colors disabled:opacity-50"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 size={12} />
                      Borrar
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
