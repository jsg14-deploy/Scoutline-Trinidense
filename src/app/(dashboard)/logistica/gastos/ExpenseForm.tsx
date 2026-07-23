"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createLogisticsExpense } from "@/app/actions/logistics";

type Props = {
  trips: { id: string; destination: string; departureDate: Date }[];
  providers: { id: string; name: string }[];
};

export function ExpenseForm({ trips, providers }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const data = {
      amount: Number(formData.get("amount")),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      tripId: formData.get("tripId") as string || undefined,
      providerId: formData.get("providerId") as string || undefined,
    };
    
    startTransition(async () => {
      await createLogisticsExpense(data);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-border bg-card p-5 grid gap-4">
      <h3 className="font-semibold text-text uppercase tracking-wider text-xs border-b border-border pb-2">
        Registrar Gasto
      </h3>
      
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Descripción</label>
        <input 
          name="description" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: Almuerzo delegación"
        />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Monto (USD/PYG)</label>
          <input 
            type="number"
            step="0.01"
            name="amount" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted">Categoría</label>
          <select 
            name="category" 
            required 
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="Viático">Viático</option>
            <option value="Factura">Factura</option>
            <option value="Pasajes">Pasajes</option>
            <option value="Comida">Comida</option>
            <option value="Varios">Varios</option>
          </select>
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Viaje Asociado (Opcional)</label>
        <select 
          name="tripId" 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="">Ninguno</option>
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.destination} ({new Date(t.departureDate).toLocaleDateString("es-PY")})</option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Proveedor (Opcional)</label>
        <select 
          name="providerId" 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="">Ninguno</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Estado</label>
        <select 
          name="status" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="pending">Pendiente de Aprobación</option>
          <option value="approved">Aprobado</option>
          <option value="paid">Pagado</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={16} />
        {pending ? "Guardando..." : "Registrar Gasto"}
      </button>
    </form>
  );
}
