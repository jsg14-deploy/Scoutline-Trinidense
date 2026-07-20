"use client";

import { useTransition } from "react";
import { runTeamClustering } from "@/app/actions/algorithms";

export function RunClusteringButton({ season }: { season: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || !season}
      onClick={() => startTransition(() => runTeamClustering(season))}
      className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Recalculando…" : `Recalcular clustering (${season})`}
    </button>
  );
}
