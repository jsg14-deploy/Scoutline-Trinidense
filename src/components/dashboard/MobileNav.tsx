"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/dashboard/navLinks";
import { EXTERNAL_LINKS } from "@/lib/dashboard/externalLinks";

export function MobileNav({ tenantName }: { tenantName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="border-b border-border bg-surface/80 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Logo size={24} className="shrink-0" />
            <span className="truncate text-sm font-bold text-text">{tenantName}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg border border-border p-2 text-muted hover:text-text"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo size={24} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </>
  );
}
