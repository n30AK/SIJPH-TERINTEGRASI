import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getDatabaseSslConfig(): false | { rejectUnauthorized: boolean } {
  const mode = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (mode === "disable") return false;
  if (mode === "require") {
    return { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" };
  }

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const host = new URL(connectionString).hostname.toLowerCase();
      if (["localhost", "127.0.0.1", "::1", "[::1]", "db"].includes(host)) return false;
    } catch {
      // Invalid connection strings are reported by the PostgreSQL client when it connects.
    }
  }

  // Secure default for managed/remote PostgreSQL (including Neon).
  return { rejectUnauthorized: true };
}

export function getDatabasePool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 4_000,
    ssl: getDatabaseSslConfig(),
  });
  return pool;
}

export function requireAdmin(request: Request): NextResponse | null {
  const expected = process.env.SIJPH_ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json({ error: "Akses administratif tidak dikonfigurasi." }, { status: 503 });
  }
  const provided = request.headers.get("x-sijph-admin-key");
  if (!provided) {
    return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
  }
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
  }
  return null;
}
