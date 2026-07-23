"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createLegalContract } from "@/app/actions/legal";

type Props = {
  players: { id: string; name: string }[];
};

export function ContractForm({ players }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const data = {
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      clauses: formData.get("clauses") as string,
      documentUrl: formData.get("documentUrl") as string,
      playerId: formData.get("playerId") as string || undefined,
    };
    
    startTransition(async () => {
      await createLegalContract(data);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-border bg-card p-5 grid gap-4">
      <h3 className="font-semibold text-text uppercase tracking-wider text-xs border-b border-border pb-2">
        Registrar Nuevo Contrato
      </h3>
      
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Título del Contrato</label>
        <input 
          name="title" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: Contrato Profesional 2025"
        />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Tipo</label>
          <select 
            name="type" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="Jugador">Jugador</option>
            <option value="Staff">Cuerpo Técnico</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Proveedor">Proveedor</option>
            <option value="Transferencia">Acuerdo Transferencia</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Vincular a Jugador</label>
          <select 
            name="playerId" 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="">Ninguno</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Inicio de Vigencia</label>
          <input 
            type="date"
            name="startDate" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Vencimiento</label>
          <input 
            type="date"
            name="endDate" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Cláusulas Importantes</label>
        <textarea 
          name="clauses" 
          rows={3}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none custom-scrollbar" 
          placeholder="Ej: Cláusula de rescisión de $500,000. Bono por 10 goles."
        />
      </div>

      <button 
        type="submit" 
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={16} />
        {pending ? "Guardando..." : "Guardar Contrato"}
      </button>
    </form>
  );
}
