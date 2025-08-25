import { json, isAllowed } from "../_utils";

export async function HEAD(req: Request) {
  // usado só para validar o código: 200 ok, 401 bloqueado
  if (!isAllowed(req)) return new Response(null, { status: 401 });
  return new Response(null, { status: 200 });
}

export async function GET(req: Request) {
  // fallback para validação via GET
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
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Você é a Dotty, assistente criativa do DottieLab. Ajude com papelaria, mockups, Canva, reels, Pinterest, TikTok e anúncios. Tom acolhedor e motivador."
        },
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
  const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";
  return json({ reply });
}
