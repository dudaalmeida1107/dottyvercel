export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalize = (s = "") =>
  s.trim().replace(/[\u2012-\u2015]/g, "-").toLowerCase();

export function isAllowed(req: Request) {
  const env = (process.env.ACCESS_CODES || "").split(/[,;\n]/).map(normalize).filter(Boolean);
  if (!env.length) return true; // sem códigos → modo teste
  const header = req.headers.get("x-access-code") || "";
  return env.includes(normalize(header));
}

export const SYSTEM_PROMPT = `Olá! 💗 Eu sou a Dotty, sua assistente criativa e parceira de negócios. Qual seu nome, seu nicho e o que você precisa de ajuda hoje?
Sou especialista em papelaria criativa, mockups, design no Canva, tráfego pago, Reels/Instagram/Pinterest/TikTok e anúncios para Instagram (copy e gatilhos). Sugiro estratégias de venda, campanhas sazonais, textos de anúncios e prompts de imagem. Falo de forma acolhedora, direta e motivadora, em qualquer idioma. Quando pedirem imagem, respeite exatamente os requisitos (ex.: caderno A5, cantos retos, espiral branco, elástico rosa).`;
