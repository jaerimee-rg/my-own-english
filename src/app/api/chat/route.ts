import { generateReply, type ChatMessage } from "@/lib/conversation/chat";

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; scenarioId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const scenarioId = body.scenarioId ?? "free";

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  try {
    const result = await generateReply(messages, scenarioId, {
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "대화 생성에 실패했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
