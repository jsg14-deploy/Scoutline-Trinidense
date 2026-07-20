"use client";

import { useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";

export function WatchlistButton({ playerId, inWatchlist }: { playerId: string; inWatchlist: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (inWatchlist) await removeFromWatchlist(playerId);
          else await addToWatchlist(playerId);
        })
      }
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
        inWatchlist ? "border border-border bg-card text-navy" : "bg-navy text-white"
      }`}
    >
      {inWatchlist ? "En watchlist ✓" : "Agregar a watchlist"}
    </button>
  );
}
