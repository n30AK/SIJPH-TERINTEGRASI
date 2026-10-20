import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  runId: z.uuid(),
  reviewerUserId: z.uuid(),
  decision: z.enum(["approved", "rejected", "revision_requested"]),
  notes: z.string().trim().max(4000).optional(),
});

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "20");
  const limit = Number.isInteger(limitRaw) ? Math.min(50, Math.max(1, limitRaw)) : 20;
  const status = url.searchParams.get("status") ?? "needs_human_review";
  const allowedStatuses = new Set(["needs_human_review", "queued", "running", "approved", "rejected", "failed"]);
  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Filter status tidak valid." }, { status: 422 });
  }
  try {
    const result = await getDatabasePool().query(
      `SELECT id, organization_id, case_id, requested_by, analysis_type, status,
              model_provider, model_name, prompt_version, output_json, uncertainty_notes,
              created_at, completed_at, reviewed_by, reviewed_at, review_decision
       FROM ai_analysis_runs
       WHERE status = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [status, limit]
    );
    return NextResponse.json({
      items: result.rows,
      count: result.rowCount,
      notice: "Output AI adalah bahan kerja untuk ditinjau manusia, bukan nasihat hukum final. Periksa fakta, kewenangan, kutipan, status peraturan, privasi, dan ketidakpastian sebelum menyetujui.",
    });
  } catch (error) {
    console.error("legal_review_queue_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Antrean review belum tersedia atau migrasi belum diterapkan." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 12_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data review tidak valid.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const review = parsed.data;
  const client = await getDatabasePool().connect().catch(() => null);
  if (!client) return NextResponse.json({ error: "Database belum tersedia." }, { status: 503 });
  try {
    await client.query("BEGIN");
    const reviewer = await client.query("SELECT id FROM app_users WHERE id = $1 LIMIT 1", [review.reviewerUserId]);
    if (!reviewer.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Reviewer tidak ditemukan." }, { status: 422 });
    }
    const updated = await client.query(
      `UPDATE ai_analysis_runs
       SET status = CASE $3
             WHEN 'approved' THEN 'approved'
             WHEN 'rejected' THEN 'rejected'
             ELSE 'needs_human_review'
           END,
           reviewed_by = $2,
           reviewed_at = now(),
           review_decision = $3,
           uncertainty_notes = CASE
             WHEN $4::text IS NULL OR $4::text = '' THEN uncertainty_notes
             ELSE concat_ws(E'\\n', uncertainty_notes, 'Catatan reviewer: ' || $4::text)
           END
       WHERE id = $1 AND status IN ('needs_human_review', 'queued', 'running', 'approved', 'rejected')
       RETURNING id, status, reviewed_by, reviewed_at, review_decision, uncertainty_notes`,
      [review.runId, review.reviewerUserId, review.decision, review.notes ?? null]
    );
    if (!updated.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Analisis tidak ditemukan atau statusnya tidak dapat direview." }, { status: 404 });
    }
    await client.query("COMMIT");
    return NextResponse.json({
      review: updated.rows[0],
      notice: review.decision === "approved"
        ? "Review manusia tercatat. Persetujuan ini tidak membuktikan kebenaran hukum secara otomatis; pastikan semua kutipan dan status sumber telah diverifikasi."
        : review.decision === "rejected"
          ? "Penolakan review tercatat."
          : "Permintaan revisi tercatat; hasil tetap memerlukan pemeriksaan manusia sebelum dipakai.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("legal_review_update_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Review gagal disimpan; transaksi dibatalkan." }, { status: 503 });
  } finally {
    client.release();
  }
}
