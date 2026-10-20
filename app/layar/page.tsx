"use client";

import { FormEvent, useEffect, useState } from "react";
import { Monitor, RefreshCw, ShieldCheck, Wifi, WifiOff } from "lucide-react";

type SignageItem = {
  id: string;
  title: string;
  content_type: "announcement" | "image" | "video" | "education" | "advertisement";
  asset_url: string | null;
  body: string | null;
  duration_seconds: number;
  sort_order: number;
};

type Feed = {
  screen: { code: string; name: string; location: string | null };
  items: SignageItem[];
  generatedAt: string;
};

function safeMediaUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function SignagePlayerPage() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [configured, setConfigured] = useState(false);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  async function refreshFeed(showLoading = false) {
    if (!configured || !code.trim() || !token.trim()) return;
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`/api/signage/${encodeURIComponent(code.trim())}`, {
        headers: { "x-sijph-screen-token": token },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Feed layar tidak tersedia.");
      const nextFeed = result as Feed;
      setFeed(nextFeed);
      setError("");
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      setActiveIndex(index => nextFeed.items.length ? index % nextFeed.items.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tidak dapat terhubung ke server.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim() || token.trim().length < 24) {
      setError("Masukkan kode layar dan token rahasia yang valid (minimal 24 karakter).");
      return;
    }
    setFeed(null);
    setError("");
    setConfigured(true);
  }

  function disconnect() {
    setConfigured(false);
    setFeed(null);
    setToken("");
    setCode("");
    setError("");
  }

  useEffect(() => {
    if (!configured) return;
    void refreshFeed(true);
    const poll = window.setInterval(() => void refreshFeed(false), 15000);
    return () => window.clearInterval(poll);
    // Refresh is intentionally driven by the connection settings and a fixed polling interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, code, token]);

  useEffect(() => {
    if (!feed || feed.items.length < 2) return;
    const current = feed.items[activeIndex];
    const delay = Math.max(5, Math.min(600, current?.duration_seconds ?? 15)) * 1000;
    const rotation = window.setTimeout(() => setActiveIndex(index => (index + 1) % feed.items.length), delay);
    return () => window.clearTimeout(rotation);
  }, [feed, activeIndex]);

  const item = feed?.items[activeIndex];
  const mediaUrl = safeMediaUrl(item?.asset_url ?? null);

  return (
    <main className="signage-shell">
      {!configured ? (
        <section className="signage-setup">
          <div className="signage-brand"><span><Monitor size={22} /></span><div><strong>SIJPH</strong><small>DIGITAL SIGNAGE PLAYER</small></div></div>
          <h1>Konfigurasi layar</h1>
          <p>Masukkan kode layar dan token khusus perangkat yang dibuat oleh administrator. Token hanya digunakan di sesi halaman ini dan tidak disimpan ke repository atau local storage.</p>
          <form onSubmit={connect}>
            <label htmlFor="screen-code">Kode layar</label>
            <input id="screen-code" value={code} onChange={event => setCode(event.target.value)} placeholder="RUANG-TUNGGU-01" autoComplete="off" required />
            <label htmlFor="screen-token">Token rahasia layar</label>
            <input id="screen-token" type="password" value={token} onChange={event => setToken(event.target.value)} placeholder="Token dari administrator" autoComplete="new-password" minLength={24} required />
            {error && <p className="signage-error" role="alert">{error}</p>}
            <button type="submit"><ShieldCheck size={17} /> Hubungkan layar</button>
          </form>
          <p className="signage-note">Gunakan perangkat dan jaringan yang dikelola institusi. Jangan memasukkan admin API key di halaman ini.</p>
        </section>
      ) : (
        <section className="signage-stage">
          <header className="signage-topbar">
            <div className="signage-brand"><span><Monitor size={22} /></span><div><strong>{feed?.screen.name ?? "SIJPH"}</strong><small>{feed?.screen.location ?? code}</small></div></div>
            <div className="signage-status">{error ? <><WifiOff size={16} /> Gangguan koneksi</> : <><Wifi size={16} /> {loading ? "Menghubungkan…" : "Terhubung"}</>}<button onClick={() => void refreshFeed(true)} aria-label="Muat ulang feed" title="Muat ulang"><RefreshCw size={16} /></button><button onClick={disconnect}>Konfigurasi</button></div>
          </header>
          {error && <div className="signage-banner" role="status">{error} — mencoba kembali otomatis.</div>}
          {item ? (
            <article className="signage-slide" key={item.id}>
              <div className="signage-eyebrow">{item.content_type.replaceAll("_", " ").toUpperCase()} · INFORMASI PELAYANAN</div>
              <h1>{item.title}</h1>
              {item.body && <p>{item.body}</p>}
              {mediaUrl && item.content_type === "image" && <img className="signage-image" src={mediaUrl} alt={item.title} />}
              {mediaUrl && item.content_type === "video" && <video className="signage-video" src={mediaUrl} autoPlay muted playsInline controls={false} onEnded={() => setActiveIndex(index => feed?.items.length ? (index + 1) % feed.items.length : 0)} />}
              {item.asset_url && !mediaUrl && <p className="signage-note">Media diabaikan karena URL tidak aman atau tidak valid. Gunakan URL HTTPS.</p>}
              <div className="signage-slide-footer"><span>SIJPH · Informasi resmi layanan</span><span>{String(activeIndex + 1).padStart(2, "0")} / {String(feed?.items.length ?? 0).padStart(2, "0")}</span></div>
            </article>
          ) : (
            <div className="signage-empty"><Monitor size={44} /><h1>Belum ada konten tayang</h1><p>Konten yang telah dipublikasikan untuk layar ini akan muncul di sini.</p></div>
          )}
          <footer className="signage-footer"><span>Terakhir diperbarui: {lastUpdated || "menunggu feed"}</span><span>Feed diperbarui otomatis setiap 15 detik</span></footer>
        </section>
      )}
      <style jsx global>{`
        .signage-shell{min-height:100vh;background:#101b2b;color:#f7f8fa;font-family:Arial,Helvetica,sans-serif}
        .signage-setup{max-width:520px;margin:0 auto;padding:8vh 24px}
        .signage-brand{display:flex;align-items:center;gap:12px}.signage-brand>span{display:grid;place-items:center;width:46px;height:46px;border-radius:13px;background:#d7e8ff;color:#16345c}.signage-brand strong{display:block;font-size:20px;letter-spacing:.08em}.signage-brand small{display:block;margin-top:4px;font-size:10px;letter-spacing:.16em;color:#b8c5d8}
        .signage-setup h1{margin:54px 0 12px;font-size:clamp(32px,5vw,46px);letter-spacing:-.04em}.signage-setup>p{color:#c5cfdd;line-height:1.7}
        .signage-setup form{display:grid;gap:10px;margin-top:28px}.signage-setup label{margin-top:8px;font-size:13px;color:#dce5f1}.signage-setup input{width:100%;box-sizing:border-box;padding:14px;border:1px solid #46566c;border-radius:9px;background:#17263a;color:white;font:inherit}.signage-setup button{display:flex;justify-content:center;align-items:center;gap:9px;margin-top:10px;padding:14px;border:0;border-radius:9px;background:#d7e8ff;color:#16345c;font-weight:700;cursor:pointer}
        .signage-note{font-size:12px!important;color:#aab8cb!important;line-height:1.6}.signage-error{color:#ffb6b6!important;font-size:13px}
        .signage-stage{min-height:100vh;display:flex;flex-direction:column}.signage-topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px clamp(18px,4vw,60px);border-bottom:1px solid #2b3a4e}.signage-status{display:flex;align-items:center;gap:12px;color:#c5cfdd;font-size:12px}.signage-status button{border:1px solid #46566c;border-radius:7px;background:transparent;color:#f7f8fa;padding:8px 10px;cursor:pointer}.signage-banner{padding:10px 24px;background:#4b2c22;color:#ffe0c7;text-align:center;font-size:13px}
        .signage-slide{position:relative;flex:1;min-height:65vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:clamp(28px,7vw,100px);background:radial-gradient(ellipse at 85% 10%,#213e5e 0%,transparent 45%),#101b2b}.signage-eyebrow{font-size:12px;letter-spacing:.18em;color:#a9c9f2;font-weight:700}.signage-slide h1{max-width:1100px;margin:22px 0;font-size:clamp(36px,7vw,88px);line-height:1.04;letter-spacing:-.045em}.signage-slide>p{max-width:900px;color:#d5deea;font-size:clamp(19px,2.4vw,30px);line-height:1.5;white-space:pre-wrap}.signage-image,.signage-video{display:block;max-width:min(90%,1100px);max-height:50vh;object-fit:contain;margin:20px auto;border-radius:12px;align-self:center}.signage-slide-footer{display:flex;justify-content:space-between;gap:20px;width:100%;margin-top:auto;padding-top:40px;color:#aab8cb;font-size:12px}.signage-empty{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:30px;color:#b8c5d8}.signage-empty h1{color:white;font-size:clamp(28px,5vw,52px)}.signage-empty p{max-width:500px;line-height:1.6}.signage-footer{display:flex;justify-content:space-between;gap:20px;padding:14px clamp(18px,4vw,60px);color:#aab8cb;font-size:11px;border-top:1px solid #2b3a4e}
        @media(max-width:640px){.signage-topbar{align-items:flex-start;flex-direction:column}.signage-status{flex-wrap:wrap}.signage-slide-footer,.signage-footer{flex-direction:column;gap:8px}.signage-image,.signage-video{max-width:100%}}
      `}</style>
    </main>
  );
}
