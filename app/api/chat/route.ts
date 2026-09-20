import { NextResponse } from "next/server";
import { localChatResult, parseModelPayload, type ChatTurn } from "@/lib/chat";

type Body = {
  track?: string;
  prompt?: string;
  content?: string;
  message?: string;
  history?: ChatTurn[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const track = body.track ?? "track";
  const prompt = body.prompt ?? "";
  const content = body.content ?? "";
  const message = body.message?.trim() ?? "";
  const fallback = localChatResult(track, prompt, content, message);

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              'You help a YouTube creator on one project track. Reply with JSON only: {"reply": string, "prompt": string, "content": string}. prompt is the full updated production prompt. content is the full updated result. reply is a short note of what you changed.',
          },
          ...(body.history ?? []).slice(-8).map((turn) => ({
            role: turn.role,
            content: turn.text,
          })),
          {
            role: "user",
            content: `Track: ${track}\n\nCurrent prompt:\n${prompt}\n\nCurrent result:\n${content}\n\nInstruction:\n${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json(parseModelPayload(raw, fallback));
  } catch {
    return NextResponse.json(fallback);
  }
}
