import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Trash2, Building } from "lucide-react";
import { deleteLogisticsProvider } from "@/app/actions/logistics";

export default async function ProveedoresPage() {
  const session = await requireSession();

  const providers = await prisma.logisticsProvider.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="p-4 font-semibold text-muted">Nombre</th>
              <th className="p-4 font-semibold text-muted">Categoría</th>
              <th className="p-4 font-semibold text-muted">Contacto</th>
              <th className="p-4 font-semibold text-muted">Notas</th>
              <th className="p-4 font-semibold text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  <Building size={24} className="mx-auto mb-2 opacity-50" />
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="p-4 font-medium text-text">{p.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{p.contactInfo || "—"}</td>
                  <td className="p-4 text-muted truncate max-w-[200px]">{p.notes || "—"}</td>
                  <td className="p-4 text-right">
                    <form action={async () => { await deleteLogisticsProvider(p.id); }}>
                      <button className="text-muted hover:text-negative transition-colors" title="Eliminar proveedor">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <ProviderForm />
      </div>
    </div>
  );
}

// Client Component form can be placed here or extracted
import { ProviderForm } from "./ProviderForm";
