import { NextResponse } from "next/server";
import { Pool } from "pg";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(32),
  serviceCode: z.string().trim().min(2).max(64),
  summary: z.string().trim().min(10).max(3000),
  privacyConsent: z.literal(true),
});

let pool: Pool | undefined;
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000, ssl: { rejectUnauthorized: true } });
  return pool;
}

export async function POST(request: Request) {
  if (process.env.PUBLIC_INTAKE_ENABLED !== "true") {
    return NextResponse.json({ error: "Permohonan online belum diaktifkan oleh pengelola. Silakan hubungi kanal resmi organisasi." }, { status: 503 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 20_000) return NextResponse.json({ error: "Ukuran permohonan terlalu besar." }, { status: 413 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }
  const parsed = RequestSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali kolom wajib dan persetujuan privasi.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  try {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const service = await client.query("SELECT id FROM service_catalog WHERE code = $1 AND active = true LIMIT 1", [parsed.data.serviceCode]);
      if (!service.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ error: "Jenis layanan belum tersedia." }, { status: 422 }); }
      const clientInsert = await client.query(
        "INSERT INTO clients (display_name, email, phone, client_type, status) VALUES ($1, $2, $3, 'individual', 'active') RETURNING id",
        [parsed.data.fullName, parsed.data.email, parsed.data.phone]
      );
      const reference = "SJ-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      await client.query(
        "INSERT INTO privacy_consents (client_id, purpose, notice_version, source) VALUES ($1, $2, $3, 'public_web')",
        [clientInsert.rows[0].id, "initial_service_request_review", "development-v1"]
      );
      const result = await client.query(
        "INSERT INTO service_requests (reference_no, client_id, service_id, title, description, channel, status) VALUES ($1, $2, $3, $4, $5, 'web', 'submitted') RETURNING id, reference_no, status, created_at",
        [reference, clientInsert.rows[0].id, service.rows[0].id, "Permohonan " + parsed.data.serviceCode, parsed.data.summary]
      );
      await client.query("INSERT INTO service_request_events (request_id, event_type, to_status, note) VALUES ($1, 'request_submitted', 'submitted', 'Permohonan masuk melalui website publik')", [result.rows[0].id]);
      await client.query("COMMIT");
      return NextResponse.json({ message: "Permohonan berhasil diterima.", request: result.rows[0] }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  } catch (error) {
    console.error("public_service_request_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Permohonan belum dapat disimpan. Silakan coba kembali nanti atau hubungi petugas." }, { status: 503 });
  }
}
