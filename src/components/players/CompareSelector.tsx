"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PlayerSearchSelect } from "@/components/players/PlayerSearchSelect";

export function CompareSelector({ p1, p2 }: { p1?: string; p2?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (playerId: string, target: "p1" | "p2") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(target, playerId);
    router.push(`/scouting/compare?${params.toString()}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">Jugador 1</h3>
        {!p1 ? (
          <PlayerSearchSelect onSelect={(id) => handleSelect(id, "p1")} placeholder="Buscar primer jugador..." />
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm text-text font-semibold">Jugador seleccionado</span>
            <button onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("p1");
              router.push(`/scouting/compare?${params.toString()}`);
            }} className="text-xs text-muted hover:text-red-400">
              Cambiar
            </button>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#34d399] mb-4">Jugador 2</h3>
        {!p2 ? (
          <PlayerSearchSelect onSelect={(id) => handleSelect(id, "p2")} placeholder="Buscar segundo jugador..." />
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm text-text font-semibold">Jugador seleccionado</span>
            <button onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("p2");
              router.push(`/scouting/compare?${params.toString()}`);
            }} className="text-xs text-muted hover:text-red-400">
              Cambiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
