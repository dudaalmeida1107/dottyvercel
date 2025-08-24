import { json, isAllowed, SYSTEM_PROMPT } from "../_utils";

export async function GET(req: Request) {
  if (!isAllowed(req)) return json({ error: "unauthorized" }, 401);
  return json({ ok: true });
}

export async function POST(req: Request) {
  if (!isAllowed(req)) return json({ error: "unauthorized" }, 401);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "missing OPENAI_API_KEY" }, 500);

  let body: any = {};
  try { body = await req.json(); } catch {}

  const prompt = body?.prompt;
  if (!prompt) return json({ error: "missing prompt" }, 400);

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]
    })
  });

  const ct = r.headers.get("content-type") || "";
  if (!r.ok) {
    const detail = ct.includes("json") ? await r.json() : await r.text();
    return json({ error: "openai-error", detail }, 500);
  }
  const data = await r.json();
  const reply = data?.choices?.[0]?.message?.content || "";
  return json({ reply });
}
