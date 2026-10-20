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
export async function GET() {
  try {
    const result = await getPool().query(
      `SELECT t.ticket_no, t.status, c.code AS counter_code, c.name AS counter_name, t.called_at
       FROM queue_tickets t LEFT JOIN queue_counters c ON c.id = t.counter_id
       WHERE t.ticket_date = (now() AT TIME ZONE 'Asia/Jakarta')::date
         AND t.status IN ('called','serving')
       ORDER BY t.called_at DESC NULLS LAST LIMIT 20`
    );
    return NextResponse.json({ date: new Date().toISOString(), items: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Informasi antrian belum tersedia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
