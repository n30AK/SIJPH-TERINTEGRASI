import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VerifySchema = z.object({
  documentId: z.uuid(),
  versionId: z.uuid(),
  reviewerUserId: z.uuid(),
  legalStatus: z.enum(["in_force", "amended", "revoked", "expired", "draft", "not_applicable"]),
  verificationNote: z.string().trim().min(10).max(4000),
  effectiveUntil: z.iso.date().optional(),
});

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 12_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data verifikasi tidak valid.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  const client = await getDatabasePool().connect().catch(() => null);
  if (!client) return NextResponse.json({ error: "Database belum tersedia." }, { status: 503 });
  try {
    await client.query("BEGIN");
    const reviewer = await client.query(
      `SELECT u.id FROM app_users u
       WHERE u.id = $1 AND u.status = 'active'
         AND EXISTS (
           SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.code IN ('reviewer', 'admin', 'super_admin')
         )
       LIMIT 1`,
      [data.reviewerUserId]
    );
    if (!reviewer.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Reviewer tidak ditemukan." }, { status: 422 });
    }
    const target = await client.query(
      `SELECT d.id AS document_id, d.title, d.source_id, s.title AS source_title,
              s.trust_tier, s.active, v.id AS version_id, v.version_label
       FROM legal_documents d
       JOIN legal_sources s ON s.id = d.source_id
       JOIN legal_document_versions v ON v.document_id = d.id
       WHERE d.id = $1 AND v.id = $2
       FOR UPDATE OF d, v`,
      [data.documentId, data.versionId]
    );
    const row = target.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Dokumen atau versi tidak ditemukan." }, { status: 404 });
    }
    if (!row.active || row.trust_tier !== "primary_official") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Verifikasi status hukum hanya dapat dilakukan terhadap sumber primer resmi yang aktif." }, { status: 422 });
    }
    const version = await client.query(
      `UPDATE legal_document_versions
       SET verification_status = 'verified', verified_at = now(), verified_by = $3,
           change_summary = concat_ws(E'\\n', change_summary, $4::text)
       WHERE id = $1 AND document_id = $2
       RETURNING id, version_label, verification_status, verified_at, verified_by`,
      [data.versionId, data.documentId, data.reviewerUserId, data.verificationNote]
    );
    const document = await client.query(
      `UPDATE legal_documents
       SET legal_status = $2, status_verified_at = now(),
           effective_until = COALESCE($3::date, effective_until), updated_at = now()
       WHERE id = $1
       RETURNING id, title, legal_status, status_verified_at, effective_until, canonical_url`,
      [data.documentId, data.legalStatus, data.effectiveUntil ?? null]
    );
    await client.query(
      `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'legal.document.status_verified', 'legal_document', $2, $3::jsonb)`,
      [data.reviewerUserId, data.documentId, JSON.stringify({ versionId: data.versionId, legalStatus: data.legalStatus })]
    );
    await client.query("COMMIT");
    return NextResponse.json({
      document: document.rows[0],
      version: version.rows[0],
      verifiedBy: data.reviewerUserId,
      verificationNote: data.verificationNote,
      notice: "Status verifikasi tercatat berdasarkan pemeriksaan manusia. Tinjau hubungan perubahan/pencabutan dan tanggal efektif; hasil ini bukan jaminan kelengkapan basis pengetahuan.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("legal_status_verification_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Verifikasi gagal disimpan; transaksi dibatalkan." }, { status: 503 });
  } finally {
    client.release();
  }
}
