"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/dashboard/navLinks";
import { EXTERNAL_LINKS } from "@/lib/dashboard/externalLinks";
import type { UserRole } from "@/generated/prisma/enums";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  scout: "Scout",
  analyst: "Analista",
  viewer: "Observador",
};

export function Sidebar({
  tenantName,
  userName,
  role,
}: {
  tenantName: string;
  userName: string;
  role: UserRole;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Logo size={26} className="shrink-0" />
        <span className="truncate text-sm font-bold text-text">{tenantName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-card text-accent" : "text-muted hover:bg-card hover:text-text"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-2">
          Plataformas externas
        </p>
        {EXTERNAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-text"
          >
            {link.label}
            <ExternalLink size={14} />
          </a>
        ))}
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="mb-3 rounded-lg bg-card px-3 py-2">
          <p className="truncate text-xs font-semibold text-text">{userName}</p>
          <p className="text-[11px] text-muted">{ROLE_LABELS[role]}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-border-2 hover:text-text"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
