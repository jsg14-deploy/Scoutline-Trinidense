export type VideoSource = { kind: "youtube"; embedUrl: string; videoId: string } | { kind: "direct"; url: string };

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
];

export function parseVideoUrl(
  url: string,
  range?: { startSeconds?: number | null; endSeconds?: number | null },
): VideoSource {
  const startParam = range?.startSeconds ? `&start=${range.startSeconds}` : "";
  const endParam = range?.endSeconds ? `&end=${range.endSeconds}` : "";

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        kind: "youtube",
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}?enablejsapi=1${startParam}${endParam}`,
      };
    }
  }

  // Fragmento de media temporal estándar de HTML5 (#t=inicio,fin) — el
  // navegador arranca el <video> nativo directo en ese punto sin JS extra.
  const fragment =
    range?.startSeconds || range?.endSeconds
      ? `#t=${range.startSeconds ?? 0}${range.endSeconds ? `,${range.endSeconds}` : ""}`
      : "";
  return { kind: "direct", url: `${url}${fragment}` };
}
