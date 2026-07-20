"use server";

import { revalidatePath } from "next/cache";
import { recomputeTeamStyleClusters } from "@/lib/clustering/teamStyle";
import { recomputeAllSmartSearchPercentiles } from "@/lib/uploads/ingestPlayerReport";

export async function runTeamClustering(season: string) {
  await recomputeTeamStyleClusters(season);
  revalidatePath("/algorithms");
}

export async function recomputePercentiles(season: string) {
  await recomputeAllSmartSearchPercentiles(season);
  revalidatePath("/algorithms");
  revalidatePath("/scouting");
  revalidatePath("/similarity");
}
