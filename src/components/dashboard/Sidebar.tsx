"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { NAV_GROUPS } from "@/lib/dashboard/navLinks";
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface md:flex">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 bg-card/40">
        <Logo size={28} className="shrink-0" />
        <div className="min-w-0">
          <span className="block truncate text-sm font-bold text-text">{tenantName}</span>
          <span className="block text-[10px] font-semibold text-accent uppercase tracking-wider">Club Profesional</span>
        </div>
      </div>

      {/* Categorized Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-2">
              {group.title}
            </p>
            {group.items.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}`));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20 shadow-sm"
                      : "text-muted hover:bg-card hover:text-text"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} strokeWidth={isActive ? 2.25 : 1.75} className={isActive ? "text-accent" : "text-muted group-hover:text-text transition-colors"} />
                    <span className="truncate">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-extrabold text-accent">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* External Platforms */}
      <div className="border-t border-border px-3 py-3 bg-card/20">
        <p className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-2">
          Integraciones & Datos
        </p>
        <div className="grid grid-cols-2 gap-1">
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-surface/60 border border-border/50 px-2.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-text"
            >
              <span className="truncate">{link.label}</span>
              <ExternalLink size={11} className="shrink-0 opacity-60" />
            </a>
          ))}
        </div>
      </div>

      {/* User Footer */}
      <div className="border-t border-border px-4 py-3 bg-card/40">
        <div className="mb-2 flex items-center justify-between rounded-xl bg-surface border border-border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-text">{userName}</p>
            <p className="text-[10px] font-medium text-muted">{ROLE_LABELS[role]}</p>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-positive shrink-0" title="Conectado" />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted transition-all hover:border-negative/40 hover:bg-negative/10 hover:text-negative"
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
