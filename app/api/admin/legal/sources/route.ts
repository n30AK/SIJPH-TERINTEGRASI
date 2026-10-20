import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SourceSchema = z.object({
  sourceKey: z.string().trim().min(2).max(120).regex(/^[a-zA-Z0-9._-]+$/),
  title: z.string().trim().min(2).max(240),
  publisher: z.string().trim().min(2).max(240),
  sourceType: z.enum(["regulation_portal", "court_decision", "official_jdih", "internal_policy", "secondary_source", "other"]),
  canonicalUrl: z.url().max(2048),
  jurisdiction: z.string().trim().max(200).optional(),
  subjectTags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  usageRights: z.string().trim().max(1000).optional(),
  trustTier: z.enum(["primary_official", "secondary", "internal", "unverified"]).default("unverified"),
});

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const result = await getDatabasePool().query(
      `SELECT id, source_key, title, publisher, source_type, canonical_url, jurisdiction,
              subject_tags, usage_rights, trust_tier, active, last_checked_at, created_at, updated_at
       FROM legal_sources ORDER BY active DESC, trust_tier, title LIMIT 500`
    );
    return NextResponse.json({ sources: result.rows, count: result.rowCount });
  } catch (error) {
    console.error("legal_sources_list_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Registry sumber hukum belum dapat dibaca." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 16_000) return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const parsed = SourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi sumber gagal.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  try {
    const s = parsed.data;
    const result = await getDatabasePool().query(
      `INSERT INTO legal_sources
       (source_key, title, publisher, source_type, canonical_url, jurisdiction, subject_tags, usage_rights, trust_tier)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT ((COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid)), source_key) DO UPDATE SET
         title = EXCLUDED.title, publisher = EXCLUDED.publisher, source_type = EXCLUDED.source_type,
         canonical_url = EXCLUDED.canonical_url, jurisdiction = EXCLUDED.jurisdiction,
         subject_tags = EXCLUDED.subject_tags, usage_rights = EXCLUDED.usage_rights,
         trust_tier = EXCLUDED.trust_tier, updated_at = now()
       RETURNING id, source_key, title, publisher, source_type, canonical_url, jurisdiction, subject_tags, usage_rights, trust_tier, active, last_checked_at, created_at, updated_at`,
      [s.sourceKey, s.title, s.publisher, s.sourceType, s.canonicalUrl, s.jurisdiction ?? null, s.subjectTags, s.usageRights ?? null, s.trustTier]
    );
    return NextResponse.json({ source: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("legal_source_upsert_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Sumber hukum belum dapat disimpan." }, { status: 503 });
  }
}
