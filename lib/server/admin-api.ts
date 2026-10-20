import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getDatabasePool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 4_000,
    ssl: { rejectUnauthorized: true },
  });
  return pool;
}

export function requireAdmin(request: Request): NextResponse | null {
  const expected = process.env.SIJPH_ADMIN_API_KEY;
  const provided = request.headers.get("x-sijph-admin-key");
  if (!expected || !provided) {
    return NextResponse.json({ error: "Akses administratif tidak dikonfigurasi." }, { status: 503 });
  }
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
  }
  return null;
}
