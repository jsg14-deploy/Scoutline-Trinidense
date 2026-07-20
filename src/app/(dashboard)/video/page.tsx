import Link from "next/link";
import { Video as VideoIcon, PlayCircle } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { VideoClipForm } from "@/components/video/VideoClipForm";
import { VideoGeneratorForm } from "@/components/video/VideoGeneratorForm";

export default async function VideoPage() {
  const session = await requireSession();

  const [clips, players] = await Promise.all([
    prisma.videoClip.findMany({
      where: { tenantId: session.tenantId },
      include: { player: true, _count: { select: { annotations: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.player.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, positionGroup: true } }),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={VideoIcon}
        eyebrow="Análisis de video"
        title="Video"
        subtitle="Cargá clips por link, etiquetá momentos clave y pedile un análisis a la IA."
      />

      {/* Formulario de Ingesta / Carga de Clips */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-text uppercase tracking-wider text-[#f2c230]">Cargar nuevo video de referencia</h2>
        <VideoClipForm players={players} />
      </div>

      {/* Formulario de Generador Automático de Videos */}
      <div>
        <VideoGeneratorForm />
      </div>

      {/* Listado de clips cargados */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7]">Clips de referencia en base de datos</h2>
        {clips.length === 0 ? (
          <p className="text-sm text-muted">Todavía no cargaste ningún video de referencia.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <Link
                key={clip.id}
                href={`/video/${clip.id}`}
                className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-2 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <PlayCircle size={18} strokeWidth={1.8} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-text truncate max-w-[200px]">{clip.title}</h3>
                  {(clip.startSeconds || clip.endSeconds) && (
                    <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent shrink-0">
                      recorte
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {clip.player ? clip.player.name : "Sin jugador asociado"} · {clip._count.annotations} nota
                  {clip._count.annotations === 1 ? "" : "s"}
                  {clip.aiAnalysis ? " · Analizado por IA" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
