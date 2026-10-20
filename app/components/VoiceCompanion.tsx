"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Headphones, Mic, MicOff, Send, Settings2, Volume2, VolumeX, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionLike = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export default function VoiceCompanion() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Sugeng rawuh, selamat datang di SIJPH. Saya pendamping informasi hukum Anda. Kita bisa berbicara dalam Bahasa Indonesia atau Bahasa Jawa. Saya akan membantu menjelaskan langkah dan sumber hukum, serta menandai hal yang perlu diperiksa oleh advokat." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [language, setLanguage] = useState<"id-ID" | "jv-ID">("id-ID");
  const [pitch, setPitch] = useState(1.12);
  const [rate, setRate] = useState(0.94);
  const [settings, setSettings] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [error, setError] = useState("");
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const chooseVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name === voiceName)
        ?? voices.find(v => v.lang.toLowerCase() === language.toLowerCase())
        ?? voices.find(v => v.lang.toLowerCase().startsWith(language.slice(0, 2)))
        ?? voices.find(v => v.lang.toLowerCase().startsWith("id"));
      return preferred;
    };
    const handler = () => { /* Refresh available voices when the browser loads them. */ };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
  }, [language, voiceName]);

  function speak(text: string) {
    if (!voiceMode || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const selected = voices.find(v => v.name === voiceName)
      ?? voices.find(v => v.lang.toLowerCase() === language.toLowerCase())
      ?? voices.find(v => v.lang.toLowerCase().startsWith(language.slice(0, 2)))
      ?? voices.find(v => v.lang.toLowerCase().startsWith("id"));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    if (selected) utterance.voice = selected;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next); setInput(""); setBusy(true); setError("");
    try {
      const response = await fetch("/api/ai-companion", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12), language }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Pendamping sedang belum dapat menjawab. Silakan coba kembali.");
      const answer = String(result.answer || "");
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      speak(answer);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Koneksi pendamping terganggu.";
      setError(message);
    } finally { setBusy(false); }
  }

  function startListening() {
    const Speech = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!Speech) { setError("Input suara belum didukung browser ini. Gunakan Chrome/Edge terbaru atau ketik pertanyaan."); return; }
    const instance = new Speech();
    instance.lang = language; instance.interimResults = false; instance.maxAlternatives = 1;
    instance.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setListening(false); if (transcript) void send(transcript);
    };
    instance.onerror = () => { setListening(false); setError("Suara belum tertangkap. Periksa izin mikrofon dan coba kembali."); };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    setError(""); setListening(true);
    try { instance.start(); } catch { setListening(false); setError("Mikrofon sedang digunakan atau belum tersedia."); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(input); }
  function stopVoice() { window.speechSynthesis?.cancel(); setSpeaking(false); }

  return <>
    <button type="button" onClick={() => setOpen(v => !v)} aria-label={open ? "Tutup AI Companion" : "Buka AI Companion"} style={{position:"fixed",right:22,bottom:20,zIndex:60,display:"flex",alignItems:"center",gap:9,border:0,borderRadius:30,padding:"13px 17px",background:"#1e6257",color:"#fff",fontWeight:700,fontSize:12,boxShadow:"0 8px 28px #163f3b38"}}>
      {open ? <X size={20}/> : <Headphones size={20}/>} {open ? "Tutup" : "Bicara dengan SIJPH"}
    </button>
    {open && <section aria-label="AI Companion suara SIJPH" style={{position:"fixed",zIndex:59,right:18,bottom:78,width:"min(390px,calc(100vw - 28px))",height:"min(650px,calc(100dvh - 100px))",display:"flex",flexDirection:"column",overflow:"hidden",border:"1px solid #dce6dc",borderRadius:16,background:"#fff",boxShadow:"0 22px 80px #102e2540",color:"#172c2b"}}>
      <header style={{display:"flex",alignItems:"center",gap:11,padding:"15px 16px",background:"#163f3b",color:"#fff"}}>
        <span style={{width:40,height:40,borderRadius:12,background:"#2e6257",display:"grid",placeItems:"center"}}><Bot size={22}/></span>
        <div style={{flex:1}}><strong style={{display:"block",fontSize:13}}>Pendamping Hukum SIJPH</strong><span style={{display:"block",fontSize:10,opacity:.8}}>AI Companion · suara & percakapan</span></div>
        <button onClick={() => setSettings(v => !v)} aria-label="Pengaturan suara" style={{border:0,background:"transparent",color:"white"}}><Settings2 size={19}/></button>
        <button onClick={stopVoice} aria-label="Hentikan suara" style={{border:0,background:"transparent",color:"white"}}><VolumeX size={19}/></button>
      </header>
      {settings && <div style={{padding:"12px 16px",background:"#f1f5ef",borderBottom:"1px solid #e1e8df",display:"grid",gap:9,fontSize:11}}>
        <label>Bahasa / gaya tutur
          <select value={language} onChange={e => {setLanguage(e.target.value as "id-ID" | "jv-ID"); setVoiceName("");}} style={{display:"block",width:"100%",marginTop:4,padding:8,border:"1px solid #d2ddd2",borderRadius:6,background:"white"}}>
            <option value="id-ID">Bahasa Indonesia — profesional, hangat</option><option value="jv-ID">Bahasa Jawa — dicoba jika tersedia di perangkat</option>
          </select>
        </label>
        <label>Karakter suara (pitch): {pitch.toFixed(2)}<input type="range" min="0.8" max="1.4" step="0.02" value={pitch} onChange={e => setPitch(Number(e.target.value))} style={{width:"100%"}}/></label>
        <label>Kecepatan / intonasi: {rate.toFixed(2)}<input type="range" min="0.78" max="1.08" step="0.02" value={rate} onChange={e => setRate(Number(e.target.value))} style={{width:"100%"}}/></label>
        <label><input type="checkbox" checked={voiceMode} onChange={e => {setVoiceMode(e.target.checked); if (!e.target.checked) stopVoice();}}/> Bacakan jawaban secara otomatis</label>
        <p style={{margin:0,color:"#687a70"}}>Ketersediaan logat Jawa medok bergantung pada suara TTS yang dipasang di perangkat. Pengaturan pitch/tempo tidak menggantikan model suara Jawa khusus.</p>
      </div>}
      <div style={{padding:"10px 14px",background:"#f8f7f1",fontSize:10,color:"#66786e",lineHeight:1.6}}>Pendamping informasi hukum, bukan pengganti advokat. Jangan masukkan NIK, kata sandi, dokumen rahasia, atau detail perkara yang mengidentifikasi seseorang.</div>
      <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {messages.map((m,i) => <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"91%",padding:"10px 12px",borderRadius:12,borderBottomRightRadius:m.role==="user"?3:12,borderBottomLeftRadius:m.role==="assistant"?3:12,background:m.role==="user"?"#1e6257":"#f0f4ee",color:m.role==="user"?"white":"#243b34",fontSize:12,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}{m.role==="assistant" && <button onClick={() => speak(m.content)} title="Dengarkan lagi" style={{display:"inline-flex",marginLeft:7,verticalAlign:"middle",border:0,background:"transparent",color:"#1e6257"}}><Volume2 size={14}/></button>}</div>)}
        {busy && <p style={{fontSize:11,color:"#728178"}}>Pendamping sedang menyiapkan jawaban…</p>}
        <div ref={messagesEnd}/>
      </div>
      {error && <div role="status" style={{padding:"8px 13px",background:"#fff0eb",color:"#954a35",fontSize:10}}>{error}</div>}
      <div style={{padding:"10px 12px",borderTop:"1px solid #e5ebe3"}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button type="button" onClick={startListening} disabled={listening||busy} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:10,border:"1px solid #cddbd0",borderRadius:8,background:listening?"#fff0e6":"#f6f8f3",color:"#1e6257",fontSize:11,fontWeight:700}}>{listening?<Mic size={16}/>:<MicOff size={16}/>} {listening?"Mendengarkan…":"Tanya dengan suara"}</button>
          <button type="button" onClick={() => speak(messages.filter(m=>m.role==="assistant").at(-1)?.content ?? "")} disabled={speaking||!voiceMode} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 12px",border:"1px solid #cddbd0",borderRadius:8,background:"#f6f8f3",color:"#1e6257",fontSize:11}}><Volume2 size={16}/> {speaking?"Berbicara":"Dengarkan"}</button>
        </div>
        <form onSubmit={submit} style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} maxLength={2000} placeholder="Tanyakan layanan atau langkah hukum…" aria-label="Pertanyaan untuk AI Companion" style={{minWidth:0,flex:1,padding:"11px 12px",border:"1px solid #dce4db",borderRadius:8,fontSize:11,outline:"none"}}/>
          <button disabled={busy||!input.trim()} aria-label="Kirim pertanyaan" style={{width:42,border:0,borderRadius:8,background:"#1e6257",color:"#fff",display:"grid",placeItems:"center"}}><Send size={17}/></button>
        </form>
      </div>
    </section>}
  </>;
}
