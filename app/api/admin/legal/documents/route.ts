import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProvisionSchema = z.object({
  provisionKey: z.string().trim().min(1).max(100),
  chapterLabel: z.string().trim().max(120).optional(),
  articleLabel: z.string().trim().max(120).optional(),
  paragraphLabel: z.string().trim().max(120).optional(),
  heading: z.string().trim().max(500).optional(),
  text: z.string().trim().min(1).max(30_000),
});

const DocumentSchema = z.object({
  sourceId: z.uuid(),
  documentType: z.enum(["regulation", "court_decision", "guidance", "internal_policy", "template", "other"]),
  title: z.string().trim().min(3).max(500),
  documentNumber: z.string().trim().max(120).optional(),
  documentYear: z.number().int().min(1800).max(2300).optional(),
  issuer: z.string().trim().max(240).optional(),
  jurisdiction: z.string().trim().max(200).optional(),
  dateIssued: z.iso.date().optional(),
  datePromulgated: z.iso.date().optional(),
  effectiveFrom: z.iso.date().optional(),
  effectiveUntil: z.iso.date().optional(),
  canonicalUrl: z.url().max(2048),
  externalIdentifier: z.string().trim().max(240).optional(),
  versionLabel: z.string().trim().min(1).max(120),
  sourceUrl: z.url().max(2048),
  extractedText: z.string().max(500_000).optional(),
  extractionMethod: z.enum(["manual", "html", "pdf_text", "ocr", "api", "other"]).default("manual"),
  extractionQuality: z.number().min(0).max(1).optional(),
  provisions: z.array(ProvisionSchema).max(1500).default([]),
});

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 1_500_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const parsed = DocumentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi dokumen gagal.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });

  const d = parsed.data;
  const client = await getDatabasePool().connect().catch(() => null);
  if (!client) return NextResponse.json({ error: "Database belum tersedia." }, { status: 503 });
  try {
    await client.query("BEGIN");
    const source = await client.query("SELECT id FROM legal_sources WHERE id = $1 AND active = true LIMIT 1", [d.sourceId]);
    if (!source.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Sumber tidak ditemukan atau tidak aktif." }, { status: 422 });
    }
    const inserted = await client.query(
      `INSERT INTO legal_documents
       (source_id, document_type, title, document_number, document_year, issuer, jurisdiction,
        date_issued, date_promulgated, effective_from, effective_until, legal_status,
        status_verified_at, canonical_url, external_identifier)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'unverified',NULL,$12,$13)
       RETURNING id, title, document_type, document_number, document_year, legal_status, canonical_url, created_at`,
      [d.sourceId, d.documentType, d.title, d.documentNumber ?? null, d.documentYear ?? null, d.issuer ?? null,
       d.jurisdiction ?? null, d.dateIssued ?? null, d.datePromulgated ?? null, d.effectiveFrom ?? null,
       d.effectiveUntil ?? null, d.canonicalUrl, d.externalIdentifier ?? null]
    );
    const document = inserted.rows[0];
    const version = await client.query(
      `INSERT INTO legal_document_versions
       (document_id, version_label, source_url, extracted_text, extraction_method, extraction_quality, verification_status, verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',NULL)
       RETURNING id, version_label, verification_status, fetched_at`,
      [document.id, d.versionLabel, d.sourceUrl, d.extractedText ?? null, d.extractionMethod, d.extractionQuality ?? null]
    );
    for (const p of d.provisions) {
      await client.query(
        `INSERT INTO legal_provisions
         (document_version_id, provision_key, chapter_label, article_label, paragraph_label, heading, provision_text)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [version.rows[0].id, p.provisionKey, p.chapterLabel ?? null, p.articleLabel ?? null,
         p.paragraphLabel ?? null, p.heading ?? null, p.text]
      );
    }
    await client.query("COMMIT");
    return NextResponse.json({
      document,
      version: version.rows[0],
      provisionCount: d.provisions.length,
      notice: "Dokumen dan pasal disimpan sebagai belum terverifikasi. Dokumen ini tidak akan muncul pada pencarian hukum default sampai verifikasi sumber dan status dilakukan.",
    }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("legal_document_ingest_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Dokumen belum dapat disimpan; tidak ada perubahan transaksi yang disahkan." }, { status: 503 });
  } finally {
    client.release();
  }
}
