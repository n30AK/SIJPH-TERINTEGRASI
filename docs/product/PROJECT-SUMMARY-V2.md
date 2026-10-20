# SIJPH-TERINTEGRASI — Master Project Summary v2.0

**Tanggal baseline:** 20 Oktober 2026  
**Kategori:** Integrated Legal Services, Legal Intelligence & AI Companion  
**Repository:** https://github.com/n30AK/SIJPH-TERINTEGRASI  
**Database:** Neon PostgreSQL — project `empty-sky-04023805`  
**Production branch:** `br-polished-paper-b5jkz6lz`  
**Development branch pilihan:** `br-square-hill-b5ac3t1i` (Neon saat ini menamai branch ini `development-work`)  
**Bahasa:** Bahasa Indonesia  
**Status:** Dokumen baseline; bukan pernyataan bahwa seluruh fitur sudah diimplementasikan.

## Visi
SIJPH-TERINTEGRASI adalah platform pelayanan hukum terpadu yang menggabungkan operasi layanan, pengetahuan hukum yang dapat ditelusuri, analisis multi-agent, simulasi alternatif penanganan kasus, review manusia, serta pendampingan klien sejak pendaftaran sampai 90 hari setelah layanan ditutup.

## Empat pilar
1. **Legal Service & Operations OS** — pendaftaran, CRM, kasus/permohonan, dokumen dan bukti, tugas, agenda/tenggat, workflow, persetujuan, laporan, keuangan, SDM, aset, inventaris, pajak, antrean dan signage sesuai prioritas.
2. **Legal Intelligence & Simulation Engine** — timeline, pemisahan fakta/klaim/asumsi, pemetaan bukti dan isu, riset hukum, pemeriksaan versi/status aturan, argumen tandingan, skenario alternatif, risiko, prasyarat, dan laporan bersitasi.
3. **AI Companion 24/7** — bantuan intake, penjelasan status resmi, checklist, agenda, pertanyaan lanjutan, dan aftercare 90 hari berdasarkan consent. Klaim 24/7 hanya berlaku setelah infrastruktur serta kanal benar-benar tersedia dan diuji.
4. **Legal Knowledge & Governance Platform** — registry sumber, versi dokumen, pipeline ingestion, retrieval/RAG, audit, privasi, kontrol akses, evaluasi AI, dan human review.

## Arsitektur agen yang direncanakan
Intake & Interview; Fact & Evidence; Urgency & Safeguarding; Jurisdiction & Issue Spotter; Legal Research; Legal Status & Amendment; Procedure & Deadline; Scenario Simulation; Counterargument/Red-Team; Citation & Quality Verifier; Privacy & Security Gate; Human Review Coordinator; Client Companion; Aftercare; Knowledge Steward. Tidak setiap tugas memerlukan model terpisah: validasi, tenggat, otorisasi, penjadwalan, dan audit sebaiknya deterministik.

## Sumber hukum
Utamakan sumber primer: https://peraturan.go.id/, https://jdihn.go.id/, JDIH resmi lembaga terkait, https://putusan3.mahkamahagung.go.id/, dan https://www.mkri.id/. Sumber sekunder harus diberi label. Setiap sumber perlu metadata penerbit, yurisdiksi, versi, status, tanggal pemeriksaan, URL asli, kualitas ekstraksi, dan hak penggunaan.

Referensi repositori: https://github.com/ilhamfp/pasal, https://github.com/bphndigitalservice/ildis, dan https://github.com/ridwanlawson/Sistem-Informasi-Pelayanan-Jasa-Hukum-Legal-Service-System-Information. Audit lisensi, dependensi, keamanan, dan hak penggunaan sebelum memakai ulang kode/data; Pasal menggunakan AGPL-3.0.

## Alur kasus
1. Consent dan intake.
2. Kronologi serta dokumen; ringkasan dikonfirmasi klien.
3. Pemisahan fakta terdukung, klaim, bantahan, asumsi, dan kekosongan informasi.
4. Identifikasi urgensi, yurisdiksi, dan isu.
5. Retrieval sumber primer dan pemeriksaan status/versi.
6. Pemetaan unsur hukum dengan fakta/bukti.
7. Skenario alternatif dan argumen tandingan.
8. Verifikasi kutipan, privasi, dan risiko.
9. Review manusia sesuai risiko.
10. Penyampaian hasil sesuai status persetujuan dan tindak lanjut yang disetujui.

## Format laporan simulasi
Ringkasan terkonfirmasi; pihak dan timeline; fakta/klaim/asumsi; isu potensial; dasar hukum beserta kutipan, status, tanggal verifikasi dan URL; bukti pendukung/pelemah; skenario dan prasyarat; risiko dan argumen tandingan; dokumen/langkah berikutnya; ketidakpastian; reviewer dan versi analisis. Tidak ada jaminan kemenangan, vonis dari laporan sepihak, atau persentase hasil tanpa metodologi tervalidasi.

## Stack dan operasi
Next.js + TypeScript; Neon PostgreSQL; GitHub; hosting kompatibel dengan Next.js/Neon dan dipilih setelah evaluasi biaya; penyimpanan dokumen privat; adapter provider AI; pencarian teks penuh/hybrid; worker/queue/scheduler; logging, health checks, audit, backup, dan pemulihan. URL hosting bawaan dipakai sampai domain tersedia.

## Privasi dan keselamatan
RBAC dan otorisasi server-side; isolasi data klien/kasus; secret hanya di server; dokumen privat; consent terpisah sesuai tujuan; retensi/penghapusan; audit akses; proteksi prompt injection; rate limit; review manusia untuk keputusan/dokumen berisiko tinggi. Pesan proaktif harus opt-in, memiliki jam tenang/frekuensi/opt-out, dan aftercare berhenti otomatis pada hari ke-90 kecuali persetujuan baru atau layanan baru.

## Tahapan
1. Audit repository, Neon, auth, CI, hosting dan deployment.
2. Legal knowledge registry, metadata, versi, dan ingestion terbatas.
3. Portal, intake, kasus, timeline, dokumen, tugas dan akses.
4. RAG, riset hukum, status aturan, citation verifier.
5. Multi-agent analysis, red-team, simulasi.
6. Human review dan versi laporan.
7. Companion in-app.
8. Aftercare, scheduler, queue, consent dan opt-out.
9. Modul operasional berdasarkan prioritas.
10. UAT, keamanan, pilot, biaya, deployment dan rollback.

## Status yang dapat dibuktikan pada baseline
- Repository publik dan fondasi Next.js/TypeScript tersedia.
- Neon project dan tiga branch ditemukan; production branch berstatus ready.
- Database production memiliki 15 tabel aplikasi: app_users, audit_events, clients, notifications, organizations, privacy_consents, queue_counters, queue_tickets, roles, service_catalog, service_request_events, service_requests, signage_items, signage_screens, user_roles.
- CI workflow yang diperiksa menjalankan typecheck dan build; status eksekusi terbaru belum diverifikasi pada audit ini.
- Hosting belum memiliki layanan SIJPH yang ditemukan di workspace Render yang tersedia; URL produksi belum terverifikasi.
- Legal knowledge pipeline, multi-agent production, Companion, dan aftercare belum dinyatakan aktif sampai implementasi dan tes membuktikannya.

## Definition of Done
Kode ada di repo; migrasi teruji; lint/typecheck/build/tests lulus; akses dan validasi server-side berjalan; dokumentasi diperbarui; UAT lulus; fitur AI menunjukkan sumber/ketidakpastian; aftercare menghormati consent dan opt-out; deployment diverifikasi melalui URL dan smoke tests.