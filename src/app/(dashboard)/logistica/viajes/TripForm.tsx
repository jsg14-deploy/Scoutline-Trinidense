"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createLogisticsTrip } from "@/app/actions/logistics";

export function TripForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const data = {
      destination: formData.get("destination") as string,
      departureDate: formData.get("departureDate") as string,
      returnDate: formData.get("returnDate") as string,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    };
    
    startTransition(async () => {
      await createLogisticsTrip(data);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-border bg-card p-5 grid gap-4">
      <h3 className="font-semibold text-text uppercase tracking-wider text-xs border-b border-border pb-2">
        Nuevo Viaje / Concentración
      </h3>
      
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Destino / Motivo</label>
        <input 
          name="destination" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: Vs. Libertad (La Huerta)"
        />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Salida</label>
          <input 
            type="date"
            name="departureDate" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Retorno (Opcional)</label>
          <input 
            type="date"
            name="returnDate" 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Estado</label>
        <select 
          name="status" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="planned">Planificado</option>
          <option value="active">En Curso</option>
          <option value="completed">Completado</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Notas</label>
        <textarea 
          name="notes" 
          rows={2}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: Concentración en Hotel Dazzler"
        />
      </div>

      <button 
        type="submit" 
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={16} />
        {pending ? "Guardando..." : "Agregar Viaje"}
      </button>
    </form>
  );
}
