import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
let pool: Pool | undefined;
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 3_000, ssl: { rejectUnauthorized: true } });
  return pool;
}
export async function GET(request: Request) {
  const screenCode = new URL(request.url).searchParams.get("screen")?.trim();
  if (!screenCode || screenCode.length > 64) return NextResponse.json({ error: "Parameter screen wajib diisi." }, { status: 400 });
  try {
    const screen = await getPool().query("SELECT id, code, name, location_label FROM signage_screens WHERE code = $1 AND active = true LIMIT 1", [screenCode]);
    if (!screen.rowCount) return NextResponse.json({ error: "Layar tidak ditemukan atau tidak aktif." }, { status: 404 });
    const items = await getPool().query(
      `SELECT id, title, content_type, asset_url, body, duration_seconds, sort_order
       FROM signage_items
       WHERE (screen_id = $1 OR screen_id IS NULL)
         AND status = 'published'
         AND (starts_at IS NULL OR starts_at <= now())
         AND (ends_at IS NULL OR ends_at > now())
       ORDER BY sort_order ASC, created_at DESC LIMIT 50`, [screen.rows[0].id]
    );
    return NextResponse.json({ screen: screen.rows[0], items: items.rows, generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Konten layar belum tersedia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
