# Blueprint Implementasi Hybrid, Offline Installer, Digital Signage & Antrean

**Produk:** SIJPH-TERINTEGRASI  
**Status:** keputusan arsitektur dan rencana implementasi; bukan bukti fitur telah selesai atau lulus uji.  
**Prinsip:** satu produk dan satu basis kode, dapat dipasang pada infrastruktur institusi atau dijalankan pada cloud yang disetujui.

## 1. Keputusan arsitektur yang ditetapkan

1. **Deployment hybrid.** Server institusi adalah target pemasangan utama. Cloud merupakan alternatif deployment resmi, bukan aplikasi berbeda.
2. **Installer offline.** Instalasi pada server target harus dapat dilakukan tanpa mengunduh image atau dependensi dari internet selama seluruh artefak, prasyarat, dan dokumentasi yang diperlukan sudah disertakan. Aktivasi, pembaruan, AI eksternal, notifikasi eksternal, dan layanan cloud dapat memerlukan internet.
3. **Semua kanal dalam satu platform.** Website publik, workspace staf, portal klien, antarmuka aplikasi responsif/PWA, CMS digital signage, layar antrean, dan antarmuka kios menggunakan API serta model data yang konsisten.
4. **Antrean dan perangkat.** Mesin antrean belum diketahui. Implementasi awal harus memakai adapter/interface generik dan simulator; integrasi perangkat nyata baru dapat diputuskan setelah merek, model, protokol, sistem operasi, dan antarmuka perangkat diketahui.
5. **GitHub sebagai sumber kode dan CI/CD.** Neon tetap opsi PostgreSQL cloud untuk development/staging atau produksi yang disetujui. Deployment institusi harus dapat menggunakan PostgreSQL lokal agar operasi inti tidak tergantung Neon.
6. **Kesiapan komersial harus dibuktikan.** Dokumen ini tidak menyatakan sistem, signage, antrean, installer, AI multi-agent, atau deployment telah diimplementasikan atau diuji.

## 2. Gambaran arsitektur

    Website Publik / Portal Klien / Workspace Staf / PWA
                         |
          CMS Signage / Konsol Antrean / Kios
                         |
                 HTTPS / Jaringan Lokal
                         |
                API Aplikasi SIJPH + AuthZ
                         |
        +----------------+------------------+
        |                |                  |
    PostgreSQL       Queue/Event Hub    Penyimpanan File
    lokal atau Neon  realtime bila ada  privat lokal/cloud
        |                |
        |           Adapter Perangkat
        |                |
        |      Printer / speaker / display / kios
        |
    Adapter AI -> Orkestrasi AI -> Retrieval hukum terverifikasi

    GitHub -> CI dan tes -> artefak versi -> bundle installer offline

Diagram ini adalah target desain. Teknologi realtime, penyimpanan file, dan adapter perangkat harus dipilih setelah kebutuhan operasional serta perangkat aktual diaudit.

## 3. Deployment profile

### A. Institusi / on-premises (target utama)
- Aplikasi dan API berjalan pada server yang dikelola institusi, idealnya di belakang reverse proxy HTTPS.
- Database PostgreSQL dapat berada di server yang sama pada instalasi kecil atau server database terpisah sesuai kapasitas.
- Dokumen perkara disimpan di storage privat dengan permission, backup, checksum, dan kebijakan retensi.
- Layar signage dan terminal antrean pada LAN menggunakan alamat layanan lokal.
- Fungsi yang memerlukan penyedia eksternal (AI API, email/SMS/WhatsApp, sinkronisasi cloud, lisensi atau pembaruan) diberi status ketergantungan internet secara eksplisit.
- Operasi lokal dasar harus tetap tersedia ketika WAN putus sejauh layanan dan database lokal masih sehat.

### B. Cloud terkelola
- Jalankan release image yang sama pada runtime/container host cloud yang dipilih.
- Gunakan PostgreSQL terkelola; Neon merupakan opsi, bukan kewajiban.
- Terapkan domain dan HTTPS, secret manager, backup, monitoring, alerting, rate limiting, serta prosedur pemulihan.
- Signage dan perangkat kantor mengakses endpoint cloud melalui koneksi internet. Rencanakan perilaku degraded/offline untuk layar dan antrean bila internet kantor putus.
- Biaya cloud, database, penyimpanan, trafik, domain, backup, dan penggunaan model AI harus diukur dan disepakati sebelum go-live.

### C. Hybrid bertahap
- Jangan melakukan replikasi dua arah database secara ad hoc. Tentukan dengan jelas satu sumber kebenaran untuk setiap jenis data.
- Bila data transaksi utama lokal, cloud hanya menerima data yang disetujui melalui outbox/sinkronisasi terkontrol. Gunakan ID idempoten, retry, dead-letter handling, audit, dan kebijakan konflik.
- Bila database utama cloud, jangan mengklaim antrean atau layanan tetap beroperasi penuh saat koneksi internet terputus. Untuk kontinuitas lokal, diperlukan queue node lokal dan desain sinkronisasi tersendiri.
- Jangan menyalin dokumen atau informasi perkara ke cloud/AI eksternal tanpa dasar pemrosesan, persetujuan, kontrol akses, dan kebijakan retensi yang disetujui.

## 4. Cakupan kanal

### Website publik
Profil institusi, jenis layanan, persyaratan, pengumuman, kontak, edukasi hukum, dan jalur permohonan yang telah disetujui. Data rahasia perkara tidak boleh muncul pada endpoint publik.

### Workspace staf dan portal klien
Login individual, role-based access control, organisasi/tenant scope bila relevan, permohonan/kasus, penugasan, dokumen privat, jadwal/tenggat, persetujuan, audit trail, dan notifikasi. Semua otorisasi ditegakkan di server, bukan hanya disembunyikan di UI.

### Aplikasi/PWA
Prioritaskan antarmuka responsif dan PWA agar mudah dipasang pada desktop, tablet, dan ponsel tanpa membuat tiga aplikasi terpisah. Cache offline hanya untuk shell UI dan konten yang secara eksplisit diizinkan. Jangan menyimpan dokumen perkara, token sensitif, atau data personal di cache publik. Aplikasi desktop native hanya ditambahkan bila ada kebutuhan perangkat/OS yang tidak dapat dipenuhi PWA.

### Digital signage CMS
- Playlist dan jadwal tayang per layar/zona.
- Template untuk pengumuman, edukasi hukum, layanan, agenda, kampanye, dan promosi institusi.
- Preview, approval/publishing workflow, versi, expiry time, dan audit log.
- Status perangkat, heartbeat, versi konten terakhir, dan pesan fallback saat koneksi terputus.
- Layar publik tidak menampilkan nama lengkap, nomor perkara, detail kasus, atau informasi pribadi kecuali ada dasar dan desain privasi yang disetujui. Untuk antrean, gunakan nomor panggil minimal dan aturan privasi institusi.
- Konten teks/media divalidasi, batas ukuran dan tipe file diterapkan, dan pemutaran dibatasi ke playlist resmi.

### Queue Management System
- Konfigurasi layanan, loket, jam operasional, kategori, prioritas yang disahkan, dan aturan eskalasi.
- Pembuatan nomor/tiket, antrean berjalan, pemanggilan ulang, pindah loket, selesai/batal, jeda, serta audit tindakan petugas.
- Layar antrean, suara panggilan, printer tiket, dan dashboard petugas melalui adapter.
- Metrik: waktu tunggu, durasi layanan, volume, status, dan SLA bila definisinya disepakati.
- Mekanisme transaksi harus idempoten agar refresh/retry tidak menghasilkan tiket ganda. Tentukan strategi penomoran per lokasi/tanggal/layanan.
- Jika printer/speaker/perangkat gagal, tampilkan error operasional dan sediakan prosedur manual. Jangan diam-diam menandai pemanggilan berhasil.

## 5. Adapter mesin antrean dan perangkat yang belum diketahui

Sebelum integrasi hardware, kumpulkan:
- vendor, merek, model, revisi firmware, dan garansi;
- OS/driver dan apakah perangkat memiliki SDK/API;
- antarmuka yang tersedia: HTTP API, TCP/IP, serial/USB, database vendor, printer driver, atau protokol proprietary;
- format tiket, font, ukuran kertas, pemotong, speaker/audio, serta bahasa suara;
- kebutuhan jaringan, autentikasi, lisensi SDK, dan batasan penggunaan;
- prosedur pengujian dan akses unit uji dari vendor.

Desain adapter yang diharapkan: createTicket, getQueueState, callNext, recall, complete, cancel, publishDisplay, printTicket, playAnnouncement, dan healthCheck hanya untuk kemampuan yang didukung perangkat. Setiap implementasi adapter mendeklarasikan capability dan status dukungannya. Gunakan simulator untuk pengembangan sampai perangkat nyata tersedia. Jangan mengasumsikan dukungan hardware sebelum diuji.

## 6. Spesifikasi bundle offline installer

### Isi paket release
- versi aplikasi dan manifest release;
- image container untuk seluruh service yang diperlukan, dalam format yang dapat diimpor tanpa pull dari registry;
- installer/orchestrator dan template konfigurasi tanpa secret;
- migrasi database versi terurut serta prosedur validasi;
- aset frontend/signage, font, dan aset suara yang lisensinya mengizinkan distribusi;
- pemeriksaan prasyarat OS, arsitektur CPU, RAM, disk, port, DNS, TLS, waktu sistem, dan izin;
- health-check/smoke-test scripts;
- checksum SHA-256, tanda tangan artefak jika key management tersedia, SBOM, lisensi pihak ketiga, release notes, dan panduan rollback;
- dokumentasi administrator, backup/restore, incident response, dan troubleshooting.

### Alur instalasi
1. Verifikasi OS, CPU architecture, ruang disk, memori, port, waktu sistem, dan hak administrator.
2. Verifikasi checksum/signature serta versi paket.
3. Validasi konfigurasi dan keberadaan secret yang diperlukan; jangan menulis secret ke log.
4. Import image lokal; tidak melakukan pull atau install package dari internet saat mode offline.
5. Siapkan database dan jalankan migrasi dengan backup/preflight sesuai prosedur.
6. Buat administrator awal melalui prosedur bootstrap aman; paksa penggantian kredensial sementara.
7. Jalankan health check untuk database, storage, API, queue service, signage, dan integrasi eksternal.
8. Tampilkan daftar fungsi aktif, fungsi belum dikonfigurasi, dan ketergantungan internet.
9. Simpan log instalasi yang telah disanitasi dan hasil penerimaan.
10. Jika migrasi gagal, hentikan rollout dan ikuti rollback yang diuji; jangan menghapus database secara otomatis.

### Instalasi offline versus operasi offline
Installer offline berarti artefak pemasangan sudah tersedia lokal. Itu **tidak** berarti semua fungsi aplikasi bisa beroperasi tanpa internet. AI eksternal, email/SMS, sinkronisasi cloud, pembaruan, dan domain publik memerlukan jaringan sesuai layanannya. Operasi inti lokal hanya dijamin setelah diuji pada profil on-premises yang sebenarnya.

## 7. Keamanan, privasi, dan operasional
- Individual identity dan server-side RBAC untuk staf; MFA untuk administrator bila tersedia.
- TLS, secret rotation, least-privilege DB role, rate limiting, audit log, proteksi CSRF/XSS/SSRF sesuai pola aplikasi, validasi file upload, dan patch management.
- Pisahkan data produksi dari development/staging. Jangan gunakan data perkara nyata untuk pengujian tanpa otorisasi dan minimisasi.
- Backup terenkripsi, salinan di lokasi berbeda, jadwal retensi, dan uji restore terjadwal. Backup belum dianggap layak sampai restore dibuktikan.
- Pisahkan public content dari private case data dan storage. Terapkan akses minimum untuk petugas dan proses review akses.
- Catat persetujuan/versi pemberitahuan privasi, tujuan pemrosesan, retensi, penghapusan, ekspor data, dan prosedur insiden.
- AI tidak boleh menjadi satu-satunya pengambil keputusan hukum. Jawaban hukum harus menunjukkan sumber dan status verifikasi; keputusan/berkas berdampak tinggi memerlukan review manusia.
- Untuk AI eksternal, kirim data seminimal mungkin; lakukan redaksi dan jangan kirim rahasia perkara tanpa otorisasi eksplisit.
- Sediakan audit trail untuk perubahan konten signage, pengaturan antrean, dan tindakan administrator.

## 8. GitHub, CI/CD, dan release
- GitHub adalah source of truth untuk kode, dokumentasi, migration files, test suites, dan workflow.
- Pull request wajib melewati lint, typecheck, unit/integration tests yang tersedia, dependency/security checks, production build, dan container build.
- Publish artefak ber-versi; jangan gunakan tag mutable seperti latest sebagai satu-satunya penentu release produksi.
- Build release image di CI lalu buat archive offline dan manifest checksums. Pastikan image target sesuai arsitektur server yang didukung.
- Signing key tidak disimpan dalam repository; lakukan key management di luar kode.
- Release memiliki versi, commit SHA, migration version, SBOM, changelog, known issues, dan prosedur rollback.
- Deployment produksi hanya setelah persetujuan pemilik sistem dan acceptance checklist. CI hijau tidak sama dengan bukti sistem live.

## 9. Neon dan database lokal
- Neon dapat dipakai untuk development/staging dan opsi cloud production setelah backup, akses, region, biaya, konektivitas, dan privasi disetujui.
- Untuk on-premises, sediakan konfigurasi PostgreSQL lokal yang kompatibel dan dokumentasikan versi PostgreSQL yang didukung.
- Semua skema dikelola melalui migrasi idempoten/terurut dan diuji terhadap database kosong serta upgrade dari versi sebelumnya.
- File binary besar tidak disimpan sebagai kolom database tanpa alasan; gunakan storage privat dengan metadata/checksum.
- Jangan melakukan replikasi lokal-cloud sampai aturan sumber kebenaran, konflik, retry, keamanan, dan pemulihan ditetapkan.
- Sediakan export data dalam format yang dapat dipindahkan dan prosedur migrasi dari Neon ke PostgreSQL lokal atau sebaliknya.

## 10. Tahapan implementasi dan kriteria penerimaan

### P0 — Audit baseline
**Deliverable:** inventaris route/API, skema DB/migrasi, dependency map, CI state, known issues, threat model awal.  
**Lulus jika:** hasil audit merujuk pada commit dan hasil uji aktual; tidak ada klaim berdasarkan asumsi.

### P1 — Runtime portabel
**Deliverable:** Docker production, compose profile, environment schema, health/readiness checks, logging dan error handling.  
**Lulus jika:** image dapat dibangun dan dijalankan pada lingkungan uji yang didukung; secrets tidak masuk image/log; health endpoint memberikan status yang benar.

### P2 — Installer offline
**Deliverable:** bundle berisi image dan dependensi, manifest/checksum, installer, preflight, migration/backup/restore, upgrade dan rollback.  
**Lulus jika:** pemasangan bersih pada mesin uji tanpa akses internet berhasil; checksum salah ditolak; migrasi gagal tidak merusak data tanpa recovery path; upgrade dan rollback diuji.

### P3 — Kanal institusi dan signage
**Deliverable:** halaman publik, workspace, CMS signage, playlist, schedule, approval, kiosk mode dan fallback.  
**Lulus jika:** role access teruji, konten terjadwal tampil benar, konten kedaluwarsa tidak terus tayang, layar reconnect/fallback berfungsi, dan data pribadi tidak bocor.

### P4 — Queue core + simulator
**Deliverable:** queue state machine, tiket, petugas/loket, panggilan, event log, display, printer/audio adapters dan simulator.  
**Lulus jika:** tidak ada nomor ganda pada retry, perubahan status diaudit, concurrent calls diuji, dan koneksi putus menghasilkan status yang dapat dipahami.

### P5 — Hardware acceptance
**Deliverable:** adapter untuk perangkat nyata dan manual operasi.  
**Lulus jika:** vendor/model/protokol terdokumentasi; tes cetak, audio, panggil, recall, selesai, kegagalan dan recovery lulus pada unit nyata. Tahap ini menunggu identifikasi hardware.

### P6 — AI dan legal knowledge production gates
**Deliverable:** provider adapter, retrieval atas sumber hukum yang terverifikasi, sitasi, versioning, red-team, privacy gate, human review, evaluasi.  
**Lulus jika:** pengujian terukur atas akurasi sitasi, status hukum, penanganan ketidakpastian, kebocoran data, dan eskalasi manusia lulus ambang yang disepakati. Dokumentasi desain saja tidak cukup.

### P7 — Pilot dan serah terima
**Deliverable:** instalasi pilot, runbook, backup/restore evidence, monitoring, pelatihan, acceptance report, support and maintenance terms.  
**Lulus jika:** perwakilan klien menandatangani hasil penerimaan, isu kritis ditutup, prosedur pemulihan terbukti, dan pemilik operasional ditetapkan.

## 11. Informasi yang harus dikonfirmasi sebelum pengadaan/go-live
- Server institusi: OS, CPU architecture, RAM, disk, virtualisasi, lokasi dan administrator.
- Target pengguna bersamaan, jumlah loket, jumlah layar, ukuran/resolusi dan orientasi monitor.
- Jaringan LAN/WAN, VLAN, Wi-Fi, firewall, akses internet, DNS dan sertifikat.
- Merek/model mesin antrean, printer, speaker, kios dan metode integrasi.
- Pemilik data, kebijakan retensi, kontak privasi, persyaratan regulator dan klasifikasi informasi.
- Pilihan database lokal/cloud, strategi backup, RPO/RTO dan lokasi backup.
- Penyedia AI yang disetujui, aturan data yang boleh dikirim, anggaran API, dan kebijakan penggunaan.
- Domain, email/notifikasi, dukungan, SLA, jadwal pembaruan, dan mekanisme lisensi bila dibutuhkan.

## 12. Batas klaim dan status
Dokumen ini menetapkan arsitektur target dan kriteria penerimaan. Tidak ada klaim bahwa installer offline, signage CMS, queue engine, hardware adapter, sinkronisasi hybrid, atau keseluruhan AI multi-agent sudah dibuat atau lulus tes. Setiap status implementasi harus didukung commit, hasil CI/test, atau bukti uji penerimaan yang dapat ditelusuri.
