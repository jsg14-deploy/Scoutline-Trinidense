import type { MockPlayerCard } from "./mockPlayers";

function initials(name: string): string {
  const parts = name.split(",").map((p) => p.trim());
  const last = parts[0] ?? "";
  const first = parts[1] ?? "";
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function PlayerCard({ player }: { player: MockPlayerCard }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_32px_rgba(242,194,48,0.12)]">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        <span>{player.league}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">{player.flag}</span>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-2 text-sm font-bold text-white shadow-sm">
          {initials(player.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-base font-bold text-text">{player.name}</div>
          <div className="text-xs text-muted">
            {player.positionCode} · {player.age} · {player.status}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <span className="inline-block rounded-full bg-accent/25 px-2.5 py-1 text-[11px] font-semibold text-text">
          {player.tag}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
        <div>
          <div className="text-muted">Valor</div>
          <div className="font-semibold text-text">{player.marketValueRange}</div>
        </div>
        <div>
          <div className="text-muted">Salario</div>
          <div className="font-semibold text-text">{player.salaryRange}</div>
        </div>
        <div>
          <div className="text-muted">Pie</div>
          <div className="font-semibold text-text">{player.foot}</div>
        </div>
      </div>
    </div>
  );
}
