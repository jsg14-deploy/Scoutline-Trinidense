"use client";

import { motion } from "framer-motion";
import { Users, Bookmark, Trophy, HeartPulse, UploadCloud } from "lucide-react";
import { CountUp } from "@/components/ui/FadeIn";

type Stats = {
  squadPlayers: number;
  scoutedPlayers: number;
  competitions: number;
  watchlist: number;
  uploads: number;
  injuries: number;
};

const tiles = (stats: Stats) => [
  {
    label: "Plantel activo",
    value: stats.squadPlayers,
    icon: Users,
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    accent: "text-blue-400",
    border: "group-hover:border-blue-500/30",
  },
  {
    label: "Jugadores en scouting",
    value: stats.watchlist,
    icon: Bookmark,
    gradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    accent: "text-teal-400",
    border: "group-hover:border-teal-500/30",
  },
  {
    label: "Competiciones",
    value: stats.competitions,
    icon: Trophy,
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    accent: "text-accent",
    border: "group-hover:border-accent/30",
  },
  {
    label: "Jugadores lesionados",
    value: stats.injuries,
    icon: HeartPulse,
    gradient: "from-red-500/10 via-rose-500/5 to-transparent",
    accent: stats.injuries > 0 ? "text-negative" : "text-positive",
    border: stats.injuries > 0 ? "group-hover:border-negative/30" : "group-hover:border-positive/30",
  },
  {
    label: "Cargas de datos",
    value: stats.uploads,
    icon: UploadCloud,
    gradient: "from-purple-500/10 via-violet-500/5 to-transparent",
    accent: "text-purple-400",
    border: "group-hover:border-purple-500/30",
  },
];

export function DashboardTiles({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {tiles(stats).map((tile, idx) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
          className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)] ${tile.border}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
          <div className="relative z-10">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border transition-all duration-300 group-hover:scale-110 ${tile.accent}`}>
              <tile.icon size={18} strokeWidth={1.75} />
            </div>
            <div className={`mt-5 font-display text-4xl font-black tracking-tight tabular-nums ${tile.accent}`}>
              <CountUp target={tile.value} duration={1.2} />
            </div>
            <div className="mt-1.5 text-xs font-medium text-muted leading-tight">{tile.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
