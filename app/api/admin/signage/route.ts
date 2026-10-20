import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  screenId: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(180),
  contentType: z.enum(["announcement", "image", "video", "education", "advertisement"]),
  assetUrl: z.string().url().max(2048).optional(),
  body: z.string().trim().max(5000).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().min(5).max(600).default(15),
  sortOrder: z.number().int().min(0).max(100000).default(100),
}).strict().refine((v) => !v.startsAt || !v.endsAt || Date.parse(v.endsAt) > Date.parse(v.startsAt), {
  message: "Waktu akhir harus setelah waktu mulai.",
});

const updateSchema = z.object({
  itemId: z.string().uuid(),
  action: z.enum(["submit_for_review", "approve", "publish", "pause", "reject", "resume"]),
}).strict();

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const result = await getDatabasePool().query(
      `SELECT si.id, si.screen_id, ss.code AS screen_code, si.title, si.content_type,
              si.asset_url, si.body, si.starts_at, si.ends_at, si.duration_seconds,
              si.sort_order, si.status, si.created_at, si.updated_at
       FROM signage_items si
       LEFT JOIN signage_screens ss ON ss.id = si.screen_id
       ORDER BY si.updated_at DESC LIMIT 200`
    );
    return NextResponse.json({ items: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("signage_list_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Konten signage tidak dapat dibaca." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  let input: z.infer<typeof createSchema>;
  try {
    input = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Data konten signage tidak valid." }, { status: 400 });
  }
  try {
    const result = await getDatabasePool().query(
      `INSERT INTO signage_items
       (screen_id, title, content_type, asset_url, body, starts_at, ends_at, duration_seconds, sort_order, status)
       VALUES ($1::uuid, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9, 'draft')
       RETURNING id, screen_id, title, content_type, asset_url, body, starts_at, ends_at,
                 duration_seconds, sort_order, status, created_at`,
      [input.screenId ?? null, input.title, input.contentType, input.assetUrl ?? null, input.body ?? null,
       input.startsAt ?? null, input.endsAt ?? null, input.durationSeconds, input.sortOrder]
    );
    return NextResponse.json({ item: result.rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("signage_create_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Konten signage gagal disimpan." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  let input: z.infer<typeof updateSchema>;
  try {
    input = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Perintah signage tidak valid." }, { status: 400 });
  }
  const transitions: Record<string, { from: string[]; to: string }> = {
    submit_for_review: { from: ["draft", "rejected"], to: "pending_review" },
    approve: { from: ["pending_review"], to: "approved" },
    publish: { from: ["approved", "paused"], to: "published" },
    pause: { from: ["published"], to: "paused" },
    reject: { from: ["pending_review"], to: "rejected" },
    resume: { from: ["paused"], to: "published" },
  };
  const transition = transitions[input.action];
  try {
    const result = await getDatabasePool().query(
      `UPDATE signage_items
       SET status = $1, updated_at = now()
       WHERE id = $2::uuid AND status = ANY($3::text[])
       RETURNING id, title, status, updated_at`,
      [transition.to, input.itemId, transition.from]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Konten tidak ditemukan atau perubahan status tidak diizinkan." }, { status: 409 });
    }
    return NextResponse.json({ item: result.rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("signage_transition_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Status signage gagal diperbarui." }, { status: 503 });
  }
}
