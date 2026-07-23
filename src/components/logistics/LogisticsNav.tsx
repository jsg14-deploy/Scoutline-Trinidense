"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOGISTICS_TABS = [
  { name: "Resumen", href: "/logistica" },
  { name: "Viajes y Concentraciones", href: "/logistica/viajes" },
  { name: "Proveedores", href: "/logistica/proveedores" },
  { name: "Gastos y Facturas", href: "/logistica/gastos" },
];

export function LogisticsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-px custom-scrollbar">
      {LOGISTICS_TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-muted hover:border-border hover:text-text hover:bg-surface"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
