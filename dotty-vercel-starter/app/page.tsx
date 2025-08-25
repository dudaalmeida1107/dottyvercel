"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const WELCOME = `Oi! 😊 Que bom te ver por aqui! Posso te ajudar com algo?
Antes, me conta rapidinho:
1) Qual é o seu nome?
2) Em qual nicho você atua (papelaria criativa ou outro)?
3) Qual é o seu objetivo imediato? (ex.: ideias de posts, copy de anúncio, mockup no Canva, reels, Pinterest, TikTok...)

Com isso eu já te trago sugestões certeiras e, se quiser, até um prompt pronto pra gerar a imagem perfeita.`;

function pickErrorDetail(data: any): string {
  return (
    data?.detail?.error?.message ||
    data?.detail?.message ||
    data?.detail ||
    data?.error_description ||
    data?.error ||
    "Falha desconhecida"
  );
}

export default function Home() {
  // ---- GATE / CÓDIGO DE ACESSO ----
  const [code, setCode] = useState("");
  const [entered, setEntered] = useState(false);

  // ---- CHAT ----
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: WELCOME },
  ]);

  // ---- IMAGEM ----
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  // restaura código salvo (se houver)
  useEffect(() => {
    const saved = localStorage.getItem("access_code");
    if (saved) {
      setCode(saved);
      setEntered(true);
    }
  }, []);

  function handleEnter() {
    const c = code.trim();
    localStorage.setItem("access_code", c);
    setEntered(true);
  }

  async function sendMessage() {
    const prompt = input.trim();
    if (!prompt || loadingChat) return;

    setMsgs((m) => [...m, { role: "user", text: prompt }]);
    setInput("");
    setLoadingChat(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": code || localStorage.getItem("access_code") || "",
        },
        body: JSON.stringify({ prompt }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok || data?.error) {
        const detail = pickErrorDetail(data);
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text:
              "❌ Erro ao responder: " +
              detail +
              "\n\nDica: verifique sua OPENAI_API_KEY (Preview), saldo/quota ou tente novamente.",
          },
        ]);
      } else {
        const reply = (data?.reply || "").trim();
        setMsgs((m) => [...m, { role: "assistant", text: reply }]);
      }
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "❌ Erro de rede ao responder: " +
            (e?.message || "desconhecido"),
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  }

  // ==============================
  //  B) GERAR IMAGEM (COM ERRO REAL)
  // ==============================
  async function handleGenerateImage() {
    const prompt = imgPrompt.trim();
    if (!prompt || loadingImg) return;

    setLoadingImg(true);
    setImgUrl(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": code || localStorage.getItem("access_code") || "",
        },
        body: JSON.stringify({ prompt }),
      });

      // Em alguns casos o backend pode devolver texto puro.
      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: "not-json", detail: raw };
      }

      if (!res.ok || data?.error) {
        const detail = pickErrorDetail(data);
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text: `🖼️❌ Erro ao gerar imagem: ${detail}
Dica: confirme OPENAI_API_KEY (Preview), saldo/quota ativos e o modelo "gpt-image-1".`,
          },
        ]);
        return;
      }

      setImgUrl(data.url); // data:image/png;base64,...
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "🖼️❌ Erro de rede ao gerar imagem: " +
            (e?.message || "desconhecido"),
        },
      ]);
    } finally {
      setLoadingImg(false);
    }
  }

  if (!entered) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Dotty Premium</h1>
        <div className="rounded-xl border p-5 bg-white/70">
          <p className="text-sm mb-3">
            Acesso por código (Kiwify/Hotmart/etc)
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="KIWI-TESTE-001"
            className="w-full rounded-lg border px-3 py-2 mb-3"
          />
          <button
            onClick={handleEnter}
            className="rounded-lg bg-pink-500 text-white px-4 py-2 hover:opacity-90"
          >
            Entrar
          </button>
          <p className="text-xs mt-2 text-gray-500">
            Dica: não diferencia maiúsculas/minúsculas; aceita traços comuns.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">DOTTY IA</h1>
      <p className="text-sm text-gray-600 mb-5">
        Perfeita nas suas estratégias, campanhas & imagens
      </p>

      {/* Chat */}
      <section className="rounded-2xl border bg-white/70 p-4 mb-6">
        <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 ${
                m.role === "assistant"
                  ? "bg-pink-50 border border-pink-100"
                  : "bg-gray-50 border"
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {m.role}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escreva sua mensagem..."
            className="flex-1 rounded-xl border px-3 py-2"
          />
          <button
            onClick={sendMessage}
            disabled={loadingChat}
            className="rounded-xl bg-pink-500 text-white px-4 py-2 disabled:opacity-50"
          >
            {loadingChat ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </section>

      {/* Imagem */}
      <section className="rounded-2xl border bg-white/70 p-4">
        <h3 className="font-medium mb-3">🎨 Criar imagem</h3>
        <div className="flex gap-2">
          <input
            value={imgPrompt}
            onChange={(e) => setImgPrompt(e.target.value)}
            placeholder="Ex.: caderno A5, cantos retos, espiral branco, elástico rosa..."
            className="flex-1 rounded-xl border px-3 py-2"
          />
        <button
            onClick={handleGenerateImage}
            disabled={loadingImg}
            className="rounded-xl bg-amber-700 text-white px-4 py-2 disabled:opacity-50"
          >
            {loadingImg ? "Gerando..." : "Gerar"}
          </button>
        </div>

        {imgUrl && (
          <div className="mt-4">
            <img
              src={imgUrl}
              alt="Imagem gerada"
              className="w-full rounded-xl border"
            />
          </div>
        )}
      </section>
    </main>
  );
}
