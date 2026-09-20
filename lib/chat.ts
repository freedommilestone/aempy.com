import { applyRecommendation } from "@/lib/projects";

export type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

export type ChatResult = {
  reply: string;
  prompt: string;
  content: string;
  source: "model" | "local";
};

export function localChatResult(
  trackLabel: string,
  prompt: string,
  content: string,
  message: string,
): ChatResult {
  const nextPrompt = applyRecommendation(prompt, message);
  const stamp = message.trim();
  const nextContent = content.trim()
    ? `${content.trim()}\n\nDIRECTOR NOTE (${trackLabel}): ${stamp}`
    : stamp;
  return {
    source: "local",
    prompt: nextPrompt,
    content: nextContent,
    reply: `Written onto ${trackLabel}. Your note is in the result and added to the prompt as a refinement.`,
  };
}

export function parseModelPayload(
  raw: string,
  fallback: ChatResult,
): ChatResult {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return { ...fallback, reply: raw.trim() || fallback.reply, source: "model" };
  }
  try {
    const parsed = JSON.parse(match[0]) as {
      reply?: string;
      prompt?: string;
      content?: string;
    };
    return {
      source: "model",
      reply: parsed.reply?.trim() || fallback.reply,
      prompt: parsed.prompt?.trim() || fallback.prompt,
      content: parsed.content?.trim() || fallback.content,
    };
  } catch {
    return { ...fallback, reply: raw.trim() || fallback.reply, source: "model" };
  }
}
