# Proposal Pembangunan SIJPH-TERINTEGRASI v2.0

**Tanggal:** 20 Oktober 2026  
**Status:** Proposal konseptual/teknis untuk persetujuan ruang lingkup, jadwal, anggaran dan pelaksanaan.  
**Repository:** https://github.com/n30AK/SIJPH-TERINTEGRASI  
**Database:** Neon PostgreSQL, project `empty-sky-04023805`  
**Platform awal:** Web responsif berbahasa Indonesia.

## BAB I — Pendahuluan
Pelayanan hukum membutuhkan pengelolaan klien, kronologi, bukti, dokumen, agenda, sumber hukum dan tindak lanjut yang konsisten. SIJPH-TERINTEGRASI diusulkan sebagai platform terpadu yang menggabungkan operasional pelayanan, basis pengetahuan hukum, AI multi-agent, simulasi skenario, review manusia, dan pendampingan klien setelah layanan selesai. AI harus memiliki sumber yang dapat diperiksa, mengungkapkan ketidakpastian, dan tidak menggantikan kewenangan profesional atau otoritas hukum.

### Tujuan
1. Menyatukan pengelolaan klien dan layanan.
2. Menertibkan kronologi, bukti, dokumen, agenda dan tenggat.
3. Mempercepat riset hukum melalui sumber terverifikasi.
4. Membantu pemetaan fakta, bukti dan kekurangan informasi.
5. Menyediakan skenario alternatif beserta risiko dan asumsi.
6. Menyediakan pendamping klien dan aftercare hingga 90 hari dengan consent.
7. Menjamin audit, kontrol akses, review manusia dan tata kelola.
8. Membangun fondasi operasional yang dapat dikembangkan bertahap.

## BAB II — Ruang lingkup
### A. Legal Service & Operations OS
Pendaftaran/profil, CRM, katalog layanan, permohonan, manajemen kasus, penugasan, timeline, dokumen/bukti, tugas, agenda/tenggat, workflow, persetujuan, audit, laporan, dan penutupan. Modul keuangan, akuntansi, HR/payroll, pengadaan, inventaris/aset, pajak, kontrak, antrean dan signage dikerjakan sesuai prioritas yang disepakati.

### B. Legal Knowledge Platform
Registry sumber; metadata peraturan/putusan; versi dan relasi perubahan/pencabutan; ingestion/parsing yang diizinkan; validasi ekstraksi; pencarian; sitasi; monitoring sumber dan kegagalan. Sumber primer diprioritaskan: peraturan.go.id, jdihn.go.id, JDIH lembaga terkait, Direktori Putusan MA, dan MKRI. Cakupan awal ditentukan setelah kebutuhan, hak penggunaan, ketersediaan data dan evaluasi kualitas diperiksa.

### C. Legal Intelligence & Simulation
AI membantu membangun timeline, membedakan fakta terdukung/klaim/asumsi, memetakan isu dan bukti, menelusuri aturan, memeriksa status, menyusun alternatif prosedural, menguji argumen tandingan dan membuat laporan dengan sumber, prasyarat, risiko, dokumen dan ketidakpastian. Simulasi bukan jaminan hasil, bukan penetapan bersalah, dan tidak menyajikan probabilitas kemenangan individual tanpa metodologi tervalidasi.

### D. Human Review
Dashboard analisis yang menunggu review, sumber/kutipan, fakta/asumsi, risiko, komentar, koreksi, persetujuan/penolakan, versi laporan dan audit. Keluaran berisiko tinggi serta dokumen final harus melewati persetujuan yang sesuai.

### E. AI Companion & aftercare 90 hari
Bantuan intake, penjelasan tahapan dan status resmi, checklist, agenda, penjelasan hasil yang telah diperiksa, eskalasi ke petugas, dan dukungan opsional. Aftercare mencakup tindak lanjut yang disetujui, edukasi bersumber, check-in opsional dan survei bila disetujui. Stop otomatis pada hari ke-90 kecuali consent baru atau layanan baru. Klien dapat mengatur kanal, jam tenang, frekuensi, pause dan opt-out. Kanal eksternal diintegrasikan hanya setelah provider dan kontrolnya siap.

## BAB III — Pendekatan teknologi
Next.js/TypeScript, Neon PostgreSQL, GitHub, hosting kompatibel yang dipilih setelah evaluasi biaya dan kebutuhan background jobs, private document storage, adapter AI provider, retrieval hybrid bila layak, scheduler/queue, audit/logging, backup dan health checks. URL bawaan hosting digunakan sampai domain tersedia. Referensi repository: ilhamfp/pasal, bphndigitalservice/ildis, dan Sistem-Informasi-Pelayanan-Jasa-Hukum-Legal-Service-Information; penggunaan ulang tunduk pada audit lisensi, dependensi, keamanan dan hak. Pasal menggunakan AGPL-3.0.

## BAB IV — Keamanan dan tata kelola
Kontrol akses server-side dan isolasi data klien/kasus; dokumen privat; secret hanya di server; validasi file; audit akses/perubahan/ekspor; consent; retensi/penghapusan; perlindungan prompt injection; rate limiting; backup dan uji pemulihan. AI tidak mengirim dokumen resmi, mengajukan laporan, menghubungi pihak lain atau mengubah status resmi tanpa otorisasi. Data klien tidak digunakan untuk melatih model eksternal tanpa dasar dan persetujuan yang sah.

## BAB V — Tahapan pelaksanaan
1. Audit repo/database/auth/CI/hosting dan stabilisasi fondasi.
2. Legal knowledge registry, metadata, versi, ingestion terbatas.
3. Portal klien dan workspace kasus.
4. RAG, riset hukum, status aturan dan citation verification.
5. Multi-agent, red-team dan simulasi.
6. Human review serta laporan berversi.
7. Companion in-app.
8. Aftercare 90 hari, queue, scheduler, consent dan opt-out.
9. Modul operasional/signage sesuai prioritas.
10. UAT, pengujian keamanan, pilot, evaluasi biaya, deployment dan rollback.

## BAB VI — Anggaran
Nilai final belum ditetapkan karena memerlukan audit volume pengguna/dokumen, cakupan bidang hukum, provider AI, kanal notifikasi, penyimpanan, target SLA dan kebutuhan keamanan. Anggaran memisahkan biaya pembangunan dari biaya berulang.

| No | Komponen | Dasar estimasi |
|---|---|---|
| 1 | Analisis dan arsitektur | Hari kerja/deliverable |
| 2 | Audit dan fondasi aplikasi | Kompleksitas repo/database |
| 3 | UI/UX dan aksesibilitas | Layar dan alur |
| 4 | Case management | Workflow dan peran |
| 5 | Legal knowledge registry | Sumber dan tipe dokumen |
| 6 | Ingestion/parsing/validasi | Volume dan kualitas |
| 7 | Search/RAG/citation | Infrastruktur dan pencarian |
| 8 | Orkestrasi multi-agent | Tugas, model dan evaluasi |
| 9 | Simulasi skenario | Kompleksitas dan pengujian |
| 10 | Human review | Peran, approval, audit |
| 11 | Companion | Integrasi dan volume |
| 12 | Aftercare 90 hari | Queue, scheduler, kanal |
| 13 | Modul ERP | Modul yang disetujui |
| 14 | Antrean/signage | Layar, loket, konten |
| 15 | Keamanan/UAT | Tes dan audit |
| 16 | Deployment/dokumentasi | Konfigurasi dan runbook |
| 17 | Pelatihan | Peserta dan materi |
| 18 | Pemeliharaan | Periode dan SLA |

Biaya berulang meliputi hosting/worker, Neon, file storage/transfer, model AI/embedding, pemrosesan dokumen, kanal komunikasi, monitoring/backup, pemeliharaan sumber dan dukungan. Paket gratis hanya digunakan jika kuota, batasan dan kecukupan produksi telah diuji; biaya nol tidak dijanjikan tanpa bukti. Harga final ditentukan dari volume pekerjaan, tarif, biaya pihak ketiga, pajak, risiko, kriteria penerimaan, garansi dan pemeliharaan.

## BAB VII — Indikator keberhasilan
- Build, lint, typecheck dan tes lulus.
- Database terhubung dan migrasi terverifikasi.
- Isolasi akses antar-klien lulus tes.
- Sumber dan kutipan dapat ditelusuri.
- Status perubahan aturan ditangani dengan benar.
- Fakta dan asumsi dipisahkan.
- Simulasi menyertakan risiko, alternatif dan ketidakpastian.
- Keluaran berisiko tinggi direview.
- Companion menampilkan status resmi yang benar.
- Aftercare mematuhi consent, opt-out dan stop hari ke-90.
- Deployment memiliki URL publik dan hasil smoke test.
- UAT dan evaluasi biaya selesai.

## BAB VIII — Risiko dan mitigasi
- **Hukum usang/salah:** sumber primer, versi, status, citation verifier dan monitoring.
- **Halusinasi AI:** retrieval, red-team, larangan klaim tanpa sumber dan human review.
- **Kebocoran:** isolasi kasus, private storage, audit dan pengujian.
- **Biaya AI:** batas token, model bertingkat, anggaran per tugas dan monitoring.
- **Perubahan API:** adapter, monitoring dan fallback yang aman.
- **Pesan mengganggu:** opt-in, jam tenang, batas frekuensi, pause/opt-out.
- **Hosting gratis tak cukup:** evaluasi kuota dan rencana migrasi.
- **Ruang lingkup terlalu luas:** pilot terbatas lalu perluas berdasarkan bukti.

## BAB IX — Deliverables
Source code; migrasi database; dokumentasi arsitektur; konfigurasi tanpa secret; API docs; modul UI fungsional; agent registry; source registry; laporan simulasi bersitasi; review workflow; scheduler/aftercare; hasil build/test; dokumentasi deployment; runbook backup/pemulihan; panduan pengguna; UAT dan daftar isu. Menu atau mockup bukan deliverable fungsional tanpa alur, data, validasi dan tes.

## BAB X — Penutup
Proyek dibangun bertahap dengan prioritas pada keamanan, sumber hukum yang dapat diverifikasi, modul yang benar-benar berfungsi, kontrol biaya dan pengujian yang dapat dibuktikan. Proposal ini adalah dokumen konseptual/teknis; ruang lingkup final, jadwal, anggaran, SLA, pemeliharaan dan kriteria penerimaan harus disetujui tertulis sebelum pelaksanaan komersial.