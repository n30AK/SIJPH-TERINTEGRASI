import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createTicketSchema = z.object({
  serviceId: z.string().uuid().optional(),
  counterId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  visitorLabel: z.string().trim().min(1).max(120).optional(),
  priority: z.enum(["normal", "priority"]).default("normal"),
}).strict();

const updateSchema = z.object({
  ticketId: z.string().uuid(),
  action: z.enum(["call", "start", "skip", "complete", "cancel"]),
  counterId: z.string().uuid().optional(),
}).strict();

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1), 100);
  const allowed = ["waiting", "called", "serving", "skipped", "completed", "cancelled"];
  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: "Filter status tidak valid." }, { status: 400 });
  }
  try {
    const result = await getDatabasePool().query(
      `SELECT qt.id, qt.ticket_date, qt.ticket_no, qt.status, qt.priority, qt.visitor_label,
              qt.issued_at, qt.called_at, qt.service_started_at, qt.completed_at,
              sc.name AS service_name, qc.code AS counter_code, qc.name AS counter_name
       FROM queue_tickets qt
       LEFT JOIN service_catalog sc ON sc.id = qt.service_id
       LEFT JOIN queue_counters qc ON qc.id = qt.counter_id
       WHERE ($1::text IS NULL OR qt.status = $1)
       ORDER BY CASE qt.status WHEN 'serving' THEN 0 WHEN 'called' THEN 1 WHEN 'waiting' THEN 2 ELSE 3 END,
                CASE qt.priority WHEN 'priority' THEN 0 ELSE 1 END, qt.issued_at ASC
       LIMIT $2`,
      [status, limit]
    );
    return NextResponse.json({ tickets: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("queue_list_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Data antrean tidak dapat dibaca." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  let input: z.infer<typeof createTicketSchema>;
  try {
    input = createTicketSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Data tiket tidak valid." }, { status: 400 });
  }

  const pool = getDatabasePool();
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query("SELECT pg_advisory_xact_lock(hashtext('sijph-queue-ticket-number'))");
    const dateResult = await db.query("SELECT (now() AT TIME ZONE 'Asia/Jakarta')::date AS ticket_date");
    const ticketDate = dateResult.rows[0].ticket_date as string;
    // Count is unsafe here: deleted tickets would allow numbers to be reused.
    // Only numeric ticket labels are part of this sequence.
    const maxResult = await db.query(
      "SELECT COALESCE(MAX(ticket_no::int), 0)::int AS max_no FROM queue_tickets WHERE ticket_date = $1::date AND ticket_no ~ '^[0-9]+$'",
      [ticketDate]
    );
    const ticketNo = String(Number(maxResult.rows[0].max_no) + 1).padStart(3, "0");
    const result = await db.query(
      `INSERT INTO queue_tickets (ticket_date, ticket_no, service_id, counter_id, client_id, visitor_label, priority)
       VALUES ($1::date, $2, $3, $4, $5, $6, $7)
       RETURNING id, ticket_date, ticket_no, status, priority, visitor_label, issued_at`,
      [ticketDate, ticketNo, input.serviceId ?? null, input.counterId ?? null, input.clientId ?? null, input.visitorLabel ?? null, input.priority]
    );
    await db.query("COMMIT");
    return NextResponse.json({ ticket: result.rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await db.query("ROLLBACK").catch(() => undefined);
    console.error("queue_ticket_create_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Tiket antrean gagal dibuat." }, { status: 503 });
  } finally {
    db.release();
  }
}

export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  let input: z.infer<typeof updateSchema>;
  try {
    input = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Perintah antrean tidak valid." }, { status: 400 });
  }

  const transitions: Record<string, { from: string[]; to: string; timestamp?: string }> = {
    call: { from: ["waiting", "skipped"], to: "called", timestamp: "called_at" },
    start: { from: ["called"], to: "serving", timestamp: "service_started_at" },
    skip: { from: ["called"], to: "skipped" },
    complete: { from: ["serving"], to: "completed", timestamp: "completed_at" },
    cancel: { from: ["waiting", "called"], to: "cancelled" },
  };
  const transition = transitions[input.action];
  const timestampSql = transition.timestamp ? `, ${transition.timestamp} = now()` : "";
  try {
    const result = await getDatabasePool().query(
      `UPDATE queue_tickets
       SET status = $1${timestampSql},
           counter_id = COALESCE($2::uuid, counter_id)
       WHERE id = $3::uuid AND status = ANY($4::text[])
       RETURNING id, ticket_date, ticket_no, status, priority, counter_id, called_at, service_started_at, completed_at`,
      [transition.to, input.counterId ?? null, input.ticketId, transition.from]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Tiket tidak ditemukan atau transisi status tidak diizinkan." }, { status: 409 });
    }
    return NextResponse.json({ ticket: result.rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("queue_ticket_transition_failed", error instanceof Error ? error.message : "unknown_error");
    return NextResponse.json({ error: "Status antrean gagal diperbarui." }, { status: 503 });
  }
}
