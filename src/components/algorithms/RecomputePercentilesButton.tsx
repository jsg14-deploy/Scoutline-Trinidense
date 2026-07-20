"use client";

import { useTransition } from "react";
import { recomputePercentiles } from "@/app/actions/algorithms";

export function RecomputePercentilesButton({ season }: { season: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || !season}
      onClick={() => startTransition(() => recomputePercentiles(season))}
      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-border-2 disabled:opacity-50"
    >
      {pending ? "Recalculando…" : `Recalcular percentiles (${season})`}
    </button>
  );
}
