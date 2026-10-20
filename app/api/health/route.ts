import { NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/server/admin-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  if (!databaseConfigured) {
    return NextResponse.json({ status: "degraded", service: "sijph-terintegrasi-web", database: "not_configured", timestamp: new Date().toISOString() }, { status: 503 });
  }
  try {
    await getDatabasePool().query("SELECT 1");
    return NextResponse.json({ status: "ok", service: "sijph-terintegrasi-web", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", service: "sijph-terintegrasi-web", database: "unavailable", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
