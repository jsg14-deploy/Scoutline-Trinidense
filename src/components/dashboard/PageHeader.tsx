import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{eyebrow}</div>
        )}
        <h1 className="font-display text-2xl font-black tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
