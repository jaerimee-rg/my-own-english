import { bulkParse } from "@/lib/phrases/aiBulk";

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = body.text ?? "";
  if (!text.trim()) {
    return Response.json({ phrases: [], source: "local" });
  }

  try {
    const result = await bulkParse(text, {
      apiKey: process.env.OPENAI_API_KEY,
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "분석에 실패했어요." }, { status: 502 });
  }
}
