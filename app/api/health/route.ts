import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let pool: Pool | undefined;
export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  if (!databaseConfigured) {
    return NextResponse.json({ status: "degraded", service: "sijph-terintegrasi-web", database: "not_configured", timestamp: new Date().toISOString() }, { status: 503 });
  }
  try {
    pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 3_000, ssl: { rejectUnauthorized: true } });
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "ok", service: "sijph-terintegrasi-web", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", service: "sijph-terintegrasi-web", database: "unavailable", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
