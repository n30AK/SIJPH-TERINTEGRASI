# Blueprint Teknis SIJPH-TERINTEGRASI v2.0

**Baseline:** 20 Oktober 2026. **Stack:** Next.js, TypeScript, Neon PostgreSQL, GitHub. **Status:** rancangan target; komponen yang belum diuji tidak boleh disebut aktif.

## 1. Lapisan arsitektur
- **Experience:** situs publik, portal klien, workspace staf/reviewer/admin, AI Companion, signage dan antrean.
- **Business:** CRM, permohonan/kasus, dokumen/bukti, timeline, tugas/tenggat, workflow/approval, finance/HR/assets sesuai prioritas, laporan dan audit.
- **AI orchestration:** agent registry, orchestrator, model adapters, prompt/policy registry, retrieval, citation verifier, scenario engine, privacy/safety gates, human review, evaluation.
- **Legal knowledge:** source registry, dokumen dan versi, struktur pasal, relasi perubahan/pencabutan, putusan, SOP/template internal, ingestion dan monitoring.
- **Infrastructure:** Neon, private file storage, queue, scheduler, notification adapters, logs/metrics, backups, CI/CD dan health checks.

## 2. Case workspace
Setiap kasus memiliki organisasi/klien, nomor, kategori, prioritas, penugasan, pihak terkait, timeline, fakta, klaim, bukti, isu, dokumen berversi, tugas, tenggat, agenda, workflow, review, status, audit trail dan aftercare. Otorisasi diverifikasi server-side untuk setiap permintaan; jangan mengandalkan pemeriksaan UI.

## 3. Document & evidence
Simpan dokumen privat dengan metadata, checksum, waktu penerimaan, versi, sumber, kualitas OCR/ekstraksi, relasi kasus, akses dan retensi. File upload divalidasi tipe/ukuran/konten. Semua dokumen adalah input tak tepercaya; instruksi di dalam dokumen tidak boleh mengubah system policy. Jangan mengindeks dokumen klien ke retrieval global lintas klien.

## 4. Legal knowledge pipeline
Source registry menyimpan penerbit, tipe sumber, URL asli, yurisdiksi, bidang hukum, hak penggunaan, metode pengambilan, status dan waktu pemeriksaan. Metadata dokumen menyimpan judul, jenis, nomor/tahun, penerbit, tanggal penetapan/pengundangan/berlaku jika diketahui, status, relasi perubahan, versi, checksum, kualitas ekstraksi, lisensi dan URL.
Pipeline: fetch yang diizinkan → catat provenance → parse HTML/PDF → tandai OCR berkualitas rendah → validasi terhadap sumber asli → simpan versi/relasi → indeks teks dan semantik → cek duplikasi/metadata → verifikasi editor → monitor pembaruan dan kegagalan. Jangan mengklaim cakupan seluruh hukum Indonesia tanpa audit cakupan.

## 5. RAG dan sitasi
Identifikasi isu/yurisdiksi/periode kejadian; cari sumber primer; ambil konteks pasal dan metadata; verifikasi versi/status/tanggal efektif; ranking berdasar otoritas, relevansi dan kemutakhiran; jalankan analisis; validasi setiap kutipan; tampilkan URL; simpan snapshot sumber yang digunakan. Jika sumber tidak tersedia/bertentangan/tidak terverifikasi, ungkapkan keterbatasan dan jangan mengarang kepastian.

## 6. Agent registry dan orkestrasi
Agen: Intake & Interview; Fact & Evidence; Urgency & Safeguarding; Jurisdiction & Issue Spotter; Legal Research; Legal Status & Amendment; Procedure & Deadline; Scenario Simulation; Counterargument/Red-Team; Citation & Quality Verifier; Privacy & Security Gate; Human Review Coordinator; Client Companion; Aftercare; Knowledge Steward.
Setiap agen mencatat versi, tugas yang diizinkan, skema input/output, model/provider, tools dan akses yang diperbolehkan, kebijakan risiko, validasi, kriteria sukses, batas biaya/waktu, log, sumber dan ketidakpastian. Tugas independen boleh paralel; dependency fakta harus menunggu intake. Jangan menggunakan voting agen sebagai pengganti bukti atau review.

Output terstruktur: summary, facts/claims, sources/citations, assumptions, unknowns, risks, next steps, verification status, model/prompt version, timestamp.

## 7. Legal Case Digital Twin
Model kasus menghubungkan pihak, kronologi, fakta, klaim, bukti, isu, aturan, tugas/tenggat, opsi, skenario, reviewer dan status. Perubahan fakta/dokumen/aturan memicu identifikasi analisis terdampak dan review ulang. Laporan yang disetujui tidak boleh ditimpa diam-diam; simpan versi dan riwayat.

## 8. Scenario Simulation Engine
Setiap skenario mencantumkan fakta, asumsi eksplisit, dasar hukum dan status verifikasi, prasyarat, langkah, dokumen, risiko, argumen tandingan, biaya/kompleksitas relatif jika beralasan, tenggat yang perlu dikonfirmasi, faktor pengubah, ketidakpastian dan status review. Jangan menjanjikan hasil atau memberi probabilitas kemenangan individual tanpa metodologi tervalidasi; default tidak menyajikan probabilitas kemenangan.

## 9. Human review and risk gate
Review wajib/prioritas untuk strategi litigasi, dokumen resmi, tindakan yang memengaruhi hak, risiko keselamatan/konsekuensi serius, konflik sumber, ketidakpastian yurisdiksi/status, dan tenggat kritis. AI tidak mengirim surat, mengajukan laporan, menghubungi pihak ketiga, atau mengubah status resmi tanpa otorisasi.

## 10. Companion and aftercare
Lifecycle: consent/orientasi → intake dan konfirmasi kronologi → update berdasarkan status tercatat/checklist/agenda → ringkasan penutupan → aftercare hari 1–90 dengan follow-up yang disetujui, edukasi bersumber, check-in opsional, survei hari 7/30/60/90 bila disetujui → stop otomatis hari 90 kecuali consent baru/layanan baru. Pengguna dapat memilih kanal, jam tenang, frekuensi, jenis pesan, pause, opt-out dan menarik consent. Mulai dari inbox aplikasi; kanal eksternal hanya setelah provider, biaya, consent dan audit siap. Klaim 24/7 tidak boleh dibuat sebelum queue/scheduler/retry/monitoring/kanal diuji.

## 11. Data model konseptual
users/app_users, organizations, roles/permissions, clients/contacts/preferences, service_catalog/requests/events, cases/assignments/timelines/facts/issues/evidence, documents/versions/access_events, tasks/deadlines/appointments/workflow_events, legal_sources/documents/versions/provisions/relationships/ingestion_runs, citations/source_quality_flags, ai_runs/agent_outputs/run_sources, scenarios/actions/assumptions, human_reviews/comments/approvals, companion_preferences/messages/followup_plans, consent_records/notification_jobs/delivery_events, queue_tickets/counters, signage_screens/items, invoices/payments/expenses/accounting_entries, employees/payroll/assets/inventory, audit_logs/privacy_requests/retention_jobs. Ini model target, bukan klaim semua tabel sudah ada. Final schema harus mengikuti migrasi, foreign keys, indexes, constraints, dan test.

## 12. Security and governance
RBAC; isolasi organisasi/kasus; server-side authorization; secure sessions; secrets server-only; private storage/signed URLs; transport/storage encryption sesuai provider; file validation; audit access/change/export; consent purpose-bound; retention/deletion; prompt injection defenses; rate limiting; backups and restore drills; cross-client isolation tests; AI evaluation. Jangan menggunakan data klien untuk melatih provider eksternal tanpa dasar dan persetujuan yang sah.

## 13. Evaluation
Gunakan kasus sintetis/anonim yang penggunaannya sah. Ukur citation correctness, deteksi aturan berubah/dicabut, kelengkapan pertanyaan, pemisahan fakta/asumsi, counterarguments, unsupported legal claims, escalation, cross-client leakage, consent/opt-out, latency dan biaya per analisis. Tunda pilot bila ada kegagalan kritis pada isolasi data, sumber atau consent.

## 14. CI/CD and deployment
Audit branches/commits; validasi lockfile/package manager; lint, typecheck, tests, build; review migrasi; env vars di hosting; koneksi DB server-side; health endpoint; auth/authorization; synthetic endpoint tests; rate limits/error handling; HTTPS/public URL; smoke tests; deployment commit record; rollback dan backup. Gunakan URL bawaan provider sampai domain tersedia. Periksa kuota worker/cron/sleep/bandwidth sebelum hosting dipakai untuk produksi.

## 15. Tahapan
1. Audit repository, database, auth, CI, hosting.
2. Source registry, metadata, versi dan ingestion terbatas.
3. Case workspace, intake, dokumen, timeline dan akses.
4. RAG, research, status aturan, citation verification.
5. Multi-agent, red-team dan simulasi.
6. Reviewer workspace dan laporan berversi.
7. Companion in-app.
8. Aftercare scheduler/queue/consent/opt-out.
9. Modul operasional prioritas.
10. UAT, security tests, pilot, biaya dan deployment.

## 16. Definition of Done
Fitur dianggap selesai hanya jika kode dan migrasi ada, test terkait lulus, kontrol akses/validasi berjalan, error handling dan dokumentasi tersedia, UAT lulus, status aktual tercatat, sumber/ketidakpastian terlihat pada output hukum, consent/opt-out/stop hari 90 diuji, dan deployment diverifikasi melalui URL serta smoke tests.