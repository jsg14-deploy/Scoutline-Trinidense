"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createLogisticsProvider } from "@/app/actions/logistics";

export function ProviderForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      contactInfo: formData.get("contactInfo") as string,
      notes: formData.get("notes") as string,
    };
    
    startTransition(async () => {
      await createLogisticsProvider(data);
      // If we had a ref to the form, we could reset it here. For simplicity, we just reload or rely on server action revalidation.
      // Resetting standard form is better done via ref or controlled state.
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-border bg-card p-5 grid gap-4">
      <h3 className="font-semibold text-text uppercase tracking-wider text-xs border-b border-border pb-2">
        Nuevo Proveedor
      </h3>
      
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Nombre</label>
        <input 
          name="name" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: Hotel Excelsior"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Categoría</label>
        <select 
          name="category" 
          required 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="Hotel">Hotel</option>
          <option value="Transporte">Transporte (Bus/Vuelo)</option>
          <option value="Alimentación">Alimentación</option>
          <option value="Servicios">Servicios Varios</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Contacto</label>
        <input 
          name="contactInfo" 
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Ej: 0981 123 456"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted">Notas</label>
        <textarea 
          name="notes" 
          rows={2}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" 
          placeholder="Info adicional..."
        />
      </div>

      <button 
        type="submit" 
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={16} />
        {pending ? "Guardando..." : "Agregar Proveedor"}
      </button>
    </form>
  );
}
