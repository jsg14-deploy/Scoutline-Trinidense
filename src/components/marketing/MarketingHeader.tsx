import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo size={32} className="rounded-lg" />
          <span className="font-display text-base font-black tracking-tight text-text">Scoutline Trinidense</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          <a href="#producto" className="transition-colors hover:text-accent">
            Producto
          </a>
          <a href="#faq" className="transition-colors hover:text-accent">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-text hover:underline">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
          >
            Prueba gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
