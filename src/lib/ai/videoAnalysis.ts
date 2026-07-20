import "server-only";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

const VIDEO_ANALYSIS_PROMPT = `Sos un analista de scouting de fútbol viendo un video de un partido o de jugadas de
un jugador para "Scoutline Trinidense". Mirá el video completo y escribí un análisis táctico/técnico en español,
organizado en estas secciones con subtítulos en negrita markdown:
**Resumen** (2-3 líneas de lo que se ve en el video)
**Puntos fuertes observados** (lista de acciones concretas con minuto aproximado si es posible)
**Puntos a mejorar** (lista de acciones concretas con minuto aproximado si es posible)
**Conclusión de scouting** (una recomendación breve)
Basate solo en lo que efectivamente se ve en el video — no inventes datos que no puedas observar.`;

export type VideoTrimRange = { startSeconds?: number | null; endSeconds?: number | null };

// Solo Gemini tiene entendimiento nativo de video entre los proveedores
// configurados — Claude y ChatGPT no reciben video como input en este
// proyecto. Si en el futuro OpenAI/Anthropic suman esto, extender acá.
export async function analyzeVideoWithGemini(sourceUrl: string, range?: VideoTrimRange): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Falta configurar la clave de API de Gemini (Google) para analizar video.");
  }

  const { GoogleGenAI, createUserContent, createPartFromUri } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const source = parseVideoUrl(sourceUrl);

  // Gemini acepta acotar el tramo analizado de un video de YouTube con
  // videoMetadata (offsets en formato "Ns") — así el clip recortado se
  // analiza solo, sin tener que mirar el partido entero.
  const videoMetadata =
    range?.startSeconds || range?.endSeconds
      ? {
          ...(range.startSeconds ? { startOffset: `${range.startSeconds}s` } : {}),
          ...(range.endSeconds ? { endOffset: `${range.endSeconds}s` } : {}),
        }
      : undefined;

  if (source.kind === "youtube") {
    const response = await client.models.generateContent({
      model,
      contents: createUserContent([
        VIDEO_ANALYSIS_PROMPT,
        { fileData: { fileUri: `https://www.youtube.com/watch?v=${source.videoId}` }, videoMetadata },
      ]),
    });
    return response.text ?? "";
  }

  // Link directo a un archivo de video (no YouTube): hay que subirlo a la
  // Files API de Gemini antes de poder analizarlo — no acepta cualquier URL
  // externa directamente. Válido para clips cortos; un partido entero puede
  // superar límites de tamaño/tiempo de la función serverless.
  const videoResponse = await fetch(source.url);
  if (!videoResponse.ok || !videoResponse.body) {
    throw new Error(`No se pudo descargar el video desde la URL provista (HTTP ${videoResponse.status}).`);
  }
  const contentType = videoResponse.headers.get("content-type") ?? "video/mp4";
  const blob = await videoResponse.blob();

  const uploaded = await client.files.upload({ file: blob, config: { mimeType: contentType } });
  const response = await client.models.generateContent({
    model,
    contents: createUserContent([
      VIDEO_ANALYSIS_PROMPT,
      createPartFromUri(uploaded.uri ?? "", uploaded.mimeType ?? contentType),
    ]),
  });
  return response.text ?? "";
}
