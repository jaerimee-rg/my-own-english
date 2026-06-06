import { generateSuggestions } from "@/lib/conversation/suggest";

export async function POST(request: Request) {
  let body: { korean?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const korean = (body.korean ?? "").trim();
  if (!korean) {
    return Response.json({ error: "korean required" }, { status: 400 });
  }

  try {
    const result = await generateSuggestions(korean, {
      apiKey: process.env.OPENAI_API_KEY,
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "제안 생성에 실패했어요." }, { status: 502 });
  }
}
