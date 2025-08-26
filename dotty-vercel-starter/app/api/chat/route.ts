// app/api/chat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { json, isAllowed } from "../_utils";

export async function POST(req: Request) {
  if (!isAllowed(req)) {
    return json({ error: "unauthorized", detail: "invalid x-access-code" }, 401);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "missing OPENAI_API_KEY" }, 500);

  let body: any = {};
  try { body = await req.json(); } catch {}
  const prompt = body?.prompt;
  if (!prompt) return json({ error: "missing prompt" }, 400);

  const system = `Você é a Dotty, assistente criativa e acolhedora da DottieLab.
- Pergunte (quando fizer sentido) nome, nicho e objetivo imediato.
- Especialista em papelaria criativa, Canva, mockups, tráfego pago, reels, IG, Pinterest, TikTok.
- Também escreve anúncios persuasivos e dá prompts de imagem seguindo detalhes exatos.
- Tom: leve, amiga de negócios, motivadora, sem formalidades, inclusiva.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    const ct = r.headers.get("content-type") || "";
    if (!r.ok) {
      const detail = ct.includes("json") ? await r.json() : await r.text();
      return json({ error: "openai-error", detail }, 500);
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return json({ reply });
  } catch (e: any) {
    return json({ error: "network", detail: e?.message || String(e) }, 500);
  }
}
