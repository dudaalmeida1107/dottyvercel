export function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const normalize = (s: string) => (s || "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, ""); // remove traços, espaços, acentos, etc.

const allowList = (process.env.ACCESS_CODES || "")
  .split(",")
  .map(s => normalize(s))
  .filter(Boolean);

/** Aceita sem maiúsc/minúsc e ignora traços/espaços.
 *  Se ACCESS_CODES estiver vazio, libera geral (bom p/ teste). */
export function isAllowed(req: Request) {
  if (allowList.length === 0) return true;
  const headerCode = req.headers.get("x-access-code") || "";
  return allowList.includes(normalize(headerCode));
}
