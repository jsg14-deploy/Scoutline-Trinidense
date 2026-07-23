import {
  BarChart3,
  DollarSign,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Search,
  Sparkles,
  Target,
  UploadCloud,
  Video,
  Swords,
  Users,
  Scale,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plantel", label: "Plantel", icon: Users },
  { href: "/competicion", label: "Competición", icon: Trophy },
  { href: "/scouting", label: "Scouting", icon: Search },
  { href: "/similarity", label: "Similitud", icon: Target },
  { href: "/algorithms", label: "Algoritmos", icon: BarChart3 },
  { href: "/rival", label: "Análisis Rival", icon: Swords },
  { href: "/video", label: "Video", icon: Video },
  { href: "/medico", label: "Médico", icon: HeartPulse },
  { href: "/logistica", label: "Logística", icon: MapPin },
  { href: "/legal", label: "Área Legal", icon: Scale },
  { href: "/financiero", label: "Financiero", icon: DollarSign },
  { href: "/data", label: "Datos", icon: UploadCloud },
  { href: "/reports", label: "Reportes", icon: FileText },
  { href: "/assistant", label: "Asistente IA", icon: Sparkles },
];
