import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  query: z.string().trim().min(2).max(300),
  limit: z.number().int().min(1).max(30).default(10),
  includeUnverified: z.boolean().default(false),
});

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Parameter pencarian tidak valid.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  try {
    const { query, limit, includeUnverified } = parsed.data;
    const result = await getDatabasePool().query(
      `SELECT p.id AS provision_id, p.provision_key, p.chapter_label, p.article_label, p.paragraph_label,
              p.heading, p.provision_text, d.id AS document_id, d.title AS document_title,
              d.document_type, d.document_number, d.document_year, d.jurisdiction, d.legal_status,
              d.status_verified_at, d.canonical_url, v.id AS version_id, v.version_label,
              v.source_url, v.verification_status, v.verified_at, s.title AS source_title,
              s.publisher AS source_publisher, s.trust_tier,
              CASE WHEN v.verification_status = 'verified'
                     AND d.legal_status = 'in_force'
                     AND d.status_verified_at IS NOT NULL
                     AND d.status_verified_at >= now() - interval '180 days'
                   THEN true ELSE false END AS citation_currently_verified
       FROM legal_provisions p
       JOIN legal_document_versions v ON v.id = p.document_version_id
       JOIN legal_documents d ON d.id = v.document_id
       JOIN legal_sources s ON s.id = d.source_id
       WHERE s.active = true
         AND (p.provision_text ILIKE $1 OR COALESCE(p.heading,'') ILIKE $1 OR COALESCE(p.article_label,'') ILIKE $1 OR d.title ILIKE $1)
         AND ($2::boolean OR (v.verification_status = 'verified' AND d.legal_status = 'in_force' AND d.status_verified_at >= now() - interval '180 days' AND s.trust_tier = 'primary_official'))
       ORDER BY citation_currently_verified DESC, d.status_verified_at DESC NULLS LAST, d.title
       LIMIT $3`,
      [`%${query.replace(/[\\%_]/g, "\\$&")}%`, includeUnverified, limit]
    );
    return NextResponse.json({
      results: result.rows,
      count: result.rowCount,
      notice: includeUnverified
        ? "Hasil dapat memuat sumber yang belum terverifikasi; jangan gunakan sebagai dasar final tanpa review."
        : "Hanya hasil dengan status terverifikasi dan pemeriksaan status hukum yang masih relatif baru yang ditampilkan. Ini bukan jaminan kelengkapan atau nasihat hukum final.",
    });
  } catch (error) {
    console.error("legal_search_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Pencarian hukum belum tersedia atau skema belum siap." }, { status: 503 });
  }
}
