import {
  BarChart3,
  DollarSign,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Search,
  Sparkles,
  Target,
  UploadCloud,
  Video,
  Swords,
  Users,
  Scale,
  Trophy,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon; badge?: string };

export type NavGroup = {
  title: string;
  items: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Core & Competición",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/plantel", label: "Plantel Principal", icon: Users },
      { href: "/competicion", label: "Competición & Liga", icon: Trophy },
    ],
  },
  {
    title: "Scouting & Rendimiento",
    items: [
      { href: "/scouting", label: "Catálogo Scouting", icon: Search },
      { href: "/similarity", label: "Motor Similitud", icon: Target },
      { href: "/algorithms", label: "Algoritmos & GPS", icon: BarChart3 },
      { href: "/rival", label: "Análisis Rival", icon: Swords },
      { href: "/video", label: "Video Análisis", icon: Video },
    ],
  },
  {
    title: "Gestión Operativa",
    items: [
      { href: "/medico", label: "Área Médica", icon: HeartPulse },
      { href: "/logistica", label: "Logística & Viajes", icon: MapPin },
      { href: "/legal", label: "Área Legal & Contratos", icon: Scale },
      { href: "/financiero", label: "Finanzas & Presupuesto", icon: DollarSign },
    ],
  },
  {
    title: "Datos & Copiloto",
    items: [
      { href: "/data", label: "Gestión de Datos", icon: UploadCloud },
      { href: "/reports", label: "Reportes", icon: FileText },
      { href: "/assistant", label: "Asistente IA", icon: Sparkles, badge: "IA" },
    ],
  },
];

export const FLAT_NAV_LINKS: NavLink[] = NAV_GROUPS.flatMap(g => g.items);
export const NAV_LINKS = FLAT_NAV_LINKS;
