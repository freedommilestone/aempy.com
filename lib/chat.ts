import { applyRecommendation } from "@/lib/projects";
import type { StageId } from "@/lib/projects";

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
  stage: StageId,
  prompt: string,
  content: string,
  message: string,
): ChatResult {
  const nextPrompt = applyRecommendation(prompt, message);
  const stamp = message.trim();
  const nextContent = content.trim()
    ? `${content.trim()}\n\nDIRECTOR NOTE (${stage}): ${stamp}`
    : stamp;
  return {
    source: "local",
    prompt: nextPrompt,
    content: nextContent,
    reply: `Written onto the ${stage} stage. Your note is saved in the result and added to the prompt as a refinement. Save a version if you want this pass locked in history.`,
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
