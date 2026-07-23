import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LogisticsNav } from "@/components/logistics/LogisticsNav";

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6">
      <PageHeader
        icon={MapPin}
        eyebrow="Operaciones del Club"
        title="Logística y Viajes"
        subtitle="Gestión centralizada de concentraciones, hoteles, transportes y viáticos."
      />
      
      <LogisticsNav />
      
      <div className="min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
