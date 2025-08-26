// app/api/_utils.ts
export function json(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function norm(s: string) {
  return (s || "").trim().toUpperCase();
}

function getEnvCodes(): string[] {
  const a = process.env.ACCESS_CODE ? [process.env.ACCESS_CODE] : [];
  const b = process.env.ACCESS_CODES ? [process.env.ACCESS_CODES] : [];
  return (a.concat(b).join(","))
    .split(/[,\n;]/)
    .map(norm)
    .filter(Boolean);
}

/** Portão: true = pode passar; false = 401 */
export function isAllowed(req: Request) {
  // atalho para testes
  if (process.env.DISABLE_GATE === "1") return true;

  const configured = getEnvCodes();
  // Se não configurou nenhum código, não bloqueia (útil em dev/preview)
  if (configured.length === 0) return true;

  // header enviado pelo front
  const received =
    req.headers.get("x-access-code") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  return configured.includes(norm(received));
}
