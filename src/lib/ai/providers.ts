import "server-only";

export type AiProvider = "claude" | "chatgpt" | "gemini";
export type ChatMessage = { role: "user" | "assistant"; content: string };

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT (OpenAI)",
  gemini: "Gemini (Google)",
};

// Los nombres de modelo de OpenAI/Google quedan configurables por env var
// porque cambian más seguido que los de Anthropic — si el proveedor devuelve
// "modelo no encontrado", lo primero a revisar es ANTHROPIC/OPENAI/GEMINI_MODEL.
const DEFAULT_MODELS: Record<AiProvider, string> = {
  claude: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
  chatgpt: process.env.OPENAI_MODEL || "gpt-4o",
  gemini: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

export function isProviderConfigured(provider: AiProvider): boolean {
  if (provider === "claude") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "chatgpt") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function askProvider(
  provider: AiProvider,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  if (!isProviderConfigured(provider)) {
    throw new Error(
      `Falta configurar la clave de API de ${PROVIDER_LABELS[provider]} (variable de entorno en el servidor).`,
    );
  }

  if (provider === "claude") return askClaude(systemPrompt, messages);
  if (provider === "chatgpt") return askChatGpt(systemPrompt, messages);
  return askGemini(systemPrompt, messages);
}

async function askClaude(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: DEFAULT_MODELS.claude,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}

async function askChatGpt(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: DEFAULT_MODELS.chatgpt,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  return response.choices[0]?.message?.content ?? "";
}

async function askGemini(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await client.models.generateContent({
    model: DEFAULT_MODELS.gemini,
    config: { systemInstruction: systemPrompt },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  return response.text ?? "";
}
