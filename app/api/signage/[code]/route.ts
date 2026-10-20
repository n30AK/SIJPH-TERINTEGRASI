import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { code } = await context.params;
  if (!/^[A-Za-z0-9_-]{2,80}$/.test(code)) {
    return NextResponse.json({ error: "Kode layar tidak valid." }, { status: 400 });
  }
  const token = request.headers.get("x-sijph-screen-token") ?? "";
  if (token.length < 24 || token.length > 512) {
    return NextResponse.json({ error: "Token layar tidak valid." }, { status: 401 });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  try {
    const pool = getDatabasePool();
    const screenResult = await pool.query(
      "SELECT id, code, name, location_label, screen_token_hash FROM signage_screens WHERE code = $1 AND active = true LIMIT 1",
      [code]
    );
    const screen = screenResult.rows[0] as { id: string; code: string; name: string; location_label: string | null; screen_token_hash: string | null } | undefined;
    if (!screen?.screen_token_hash) {
      return NextResponse.json({ error: "Layar tidak ditemukan atau belum dikonfigurasi." }, { status: 404 });
    }
    const stored = Buffer.from(screen.screen_token_hash, "hex");
    const supplied = Buffer.from(tokenHash, "hex");
    if (stored.length !== supplied.length || !timingSafeEqual(stored, supplied)) {
      return NextResponse.json({ error: "Token layar tidak valid." }, { status: 401 });
    }
    await pool.query("UPDATE signage_screens SET last_seen_at = now() WHERE id = $1", [screen.id]);
    const items = await pool.query(
      `SELECT id, title, content_type, asset_url, body, duration_seconds, sort_order
       FROM signage_items
       WHERE screen_id = $1
         AND status = 'published'
         AND (starts_at IS NULL OR starts_at <= now())
         AND (ends_at IS NULL OR ends_at > now())
       ORDER BY sort_order ASC, created_at ASC LIMIT 100`,
      [screen.id]
    );
    return NextResponse.json({
      screen: { code: screen.code, name: screen.name, location: screen.location_label },
      items: items.rows,
      generatedAt: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("signage_playback_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Feed signage sementara tidak tersedia." }, { status: 503 });
  }
}
