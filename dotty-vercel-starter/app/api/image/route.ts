export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { json, isAllowed } from "../_utils";

export async function POST(req: Request) {
  if (!isAllowed(req)) return json({ error: "unauthorized" }, 401);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "missing OPENAI_API_KEY" }, 500);

  let body: any = {};
  try { body = await req.json(); } catch {}
  const prompt = body?.prompt;
  if (!prompt) return json({ error: "missing prompt" }, 400);

  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json"
    })
  });

  const ct = r.headers.get("content-type") || "";
  if (!r.ok) {
    const detail = ct.includes("json") ? await r.json() : await r.text();
    return json({ error: "openai-error", detail }, 500);
  }

  const data = await r.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return json({ error: "no-image" }, 500);
  return json({ url: `data:image/png;base64,${b64}` });
}
