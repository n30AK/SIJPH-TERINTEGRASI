import { NextResponse } from "next/server";
import { getDatabasePool, requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_TABLES = [
  "organizations", "clients", "service_catalog", "service_requests",
  "privacy_consents", "service_request_events", "app_users", "roles",
  "user_roles", "audit_events", "legal_sources", "legal_documents",
  "legal_document_versions", "legal_provisions", "legal_document_relationships",
  "legal_ingestion_runs", "legal_retrieval_citations", "ai_analysis_runs", "legal_scenarios",
];

export async function GET(request: Request) {
  const verbose = new URL(request.url).searchParams.get("details") === "1";
  if (verbose) {
    const denied = requireAdmin(request);
    if (denied) return denied;
  }
  const checks: Record<string, "ok" | "blocked" | "failed"> = {
    database_url: process.env.DATABASE_URL ? "ok" : "blocked",
    admin_secret: process.env.SIJPH_ADMIN_API_KEY ? "ok" : "blocked",
    data_controller: process.env.DATA_CONTROLLER_NAME?.trim() ? "ok" : "blocked",
    privacy_contact: process.env.PRIVACY_CONTACT_EMAIL?.trim() ? "ok" : "blocked",
    privacy_notice_version: process.env.PRIVACY_NOTICE_VERSION?.trim() ? "ok" : "blocked",
    public_intake: process.env.PUBLIC_INTAKE_ENABLED === "true" ? "ok" : "blocked",
  };
  const response = (ready: boolean, extraChecks: Record<string, "ok" | "blocked" | "failed"> = checks) =>
    NextResponse.json(
      verbose
        ? { status: ready ? "ready" : "blocked", checks: extraChecks, message: ready ? "Pemeriksaan kesiapan minimum lulus." : "Satu atau lebih persyaratan go-live belum terpenuhi." }
        : { status: ready ? "ready" : "blocked", message: ready ? "Pemeriksaan kesiapan minimum lulus." : "Layanan belum memenuhi persyaratan kesiapan." },
      { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
    );

  if (!process.env.DATABASE_URL) return response(false);
  try {
    const pool = getDatabasePool();
    const tableResult = await pool.query(
      "SELECT name, to_regclass('public.' || name) IS NOT NULL AS present FROM unnest($1::text[]) AS name",
      [REQUIRED_TABLES]
    );
    const missing = tableResult.rows.filter((row: { present: boolean }) => !row.present);
    checks.database_schema = missing.length === 0 ? "ok" : "failed";
    const services = await pool.query("SELECT count(*)::int AS count FROM service_catalog WHERE active = true");
    checks.service_catalog = services.rows[0].count >= 4 ? "ok" : "failed";
    const ready = Object.values(checks).every((status) => status === "ok");
    return response(ready);
  } catch (error) {
    console.error("readiness_check_failed", error instanceof Error ? error.message : "unknown_error");
    checks.database_schema = "failed";
    return response(false);
  }
}
