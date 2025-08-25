"use client";

const WELCOME = `Oi! Eu sou a Dotty, sua nova assistente. 💗
Antes da gente começar, me conta rapidinho:
1) Seu nome? 
2) Seu nicho?
3) O que você quer fazer hoje? (ex.: ideias de posts, copy de anúncio, estratégias de vendas, conteúdo ...)

Com isso eu já te trago sugestões certeiras ✨`;
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [entered, setEntered] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{role:"user"|"assistant"; text:string}[]>([]);
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const headers = { "Content-Type": "application/json", "x-access-code": code };

  async function enter() {
    const r = await fetch("/api/chat", { headers });
    setEntered(r.ok);
    if (!r.ok) alert("Código inválido. Verifique seu e-mail.");
  }

  async function send() {
    if (!input.trim()) return;
    const user = { role: "user" as const, text: input };
    setMsgs(m => [...m, user]);
    setInput("");
    const r = await fetch("/api/chat", { method: "POST", headers, body: JSON.stringify({ prompt: user.text }) });
    const data = await r.json();
    const assistant = { role: "assistant" as const, text: data?.reply || "Erro ao responder." };
    setMsgs(m => [...m, assistant]);
  }

  async function genImg() {
    if (!imgPrompt.trim()) return;
    const r = await fetch("/api/image", { method: "POST", headers, body: JSON.stringify({ prompt: imgPrompt }) });
    const data = await r.json();
    if (data?.url) setImgUrl(data.url); else alert("Erro ao gerar imagem.");
  }

  if (!entered) {
    return (
      <main className="min-h-screen grid place-items-center p-6 bg-dottyBlue/20">
        <div className="card max-w-md w-full">
          <h1 className="font-semibold mb-1">DOTTY IA</h1>
          <p className="text-sm text-gray-600 mb-3">Acesso por código (Kiwify)</p>
          <input className="w-full border rounded-lg p-3 mb-3" placeholder="Seu código (ex.: KIWI-2025-CLIENTE)"
                 value={code} onChange={e=>setCode(e.target.value)} />
          <button onClick={enter} className="btn w-full" style={{background:"#fa80ac"}}>Entrar</button>
          <p className="text-xs text-gray-500 mt-2">Dica: não diferencia maiúsculas/minúsculas; aceita traços comuns.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b p-3 mb-4">
        <h1 className="font-semibold">DOTTY IA</h1>
        <p className="text-sm text-gray-500">Perfeita nas suas estratégias, campanhas & imagens</p>
      </header>

      <section className="card mb-6">
        <div className="space-y-3">
          {msgs.map((m,i)=>(
            <div key={i} className={m.role==="user"?"bg-gray-100 p-3 rounded-xl":"bg-dottyPink/10 p-3 rounded-xl"}>
              <div className="text-xs opacity-60">{m.role}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input className="flex-1 border rounded-lg p-3" placeholder="Escreva sua mensagem..." value={input} onChange={e=>setInput(e.target.value)} />
          <button onClick={send} className="btn" style={{background:"#fa80ac"}}>Enviar</button>
        </div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">🎨 Criar imagem</h2>
        <div className="flex gap-2">
          <input className="flex-1 border rounded-lg p-3" placeholder="Ex.: caderno A5, cantos retos, espiral branco, elástico rosa..." value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)} />
          <button onClick={genImg} className="btn" style={{background:"#ab6b17"}}>Gerar</button>
        </div>
        {imgUrl && <img src={imgUrl} alt="gerada" className="mt-3 rounded-xl border" />}
      </section>
    </main>
  );
}
