import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { VideoPlayerPanel } from "@/components/video/VideoPlayerPanel";
import { AiVideoAnalysis } from "@/components/video/AiVideoAnalysis";
import { deleteVideoClip } from "@/app/actions/video";

type Params = Promise<{ id: string }>;

// El análisis con Gemini puede tardar bastante en videos largos.
export const maxDuration = 60;

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function VideoDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await requireSession();

  const clip = await prisma.videoClip.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { player: true, annotations: true },
  });
  if (!clip) notFound();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/video" className="text-xs text-muted hover:text-accent">
            ← Volver a Video
          </Link>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-text">{clip.title}</h1>
          {(clip.startSeconds || clip.endSeconds) && (
            <span className="mt-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
              Recorte: {formatSeconds(clip.startSeconds ?? 0)}–{formatSeconds(clip.endSeconds ?? 0)}
            </span>
          )}
          {clip.player && (
            <p className="mt-1 text-sm text-muted">
              Jugador:{" "}
              <Link href={`/players/${clip.player.id}`} className="text-accent hover:underline">
                {clip.player.name}
              </Link>
            </p>
          )}
        </div>
        <form action={deleteVideoClip.bind(null, clip.id)}>
          <button type="submit" className="text-xs font-medium text-muted hover:text-negative">
            Eliminar video
          </button>
        </form>
      </div>

      <VideoPlayerPanel
        clipId={clip.id}
        sourceUrl={clip.sourceUrl}
        startSeconds={clip.startSeconds}
        endSeconds={clip.endSeconds}
        annotations={clip.annotations}
      />

      <AiVideoAnalysis clipId={clip.id} initialAnalysis={clip.aiAnalysis} />
    </div>
  );
}
