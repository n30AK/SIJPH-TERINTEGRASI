# PROPOSAL PEMBANGUNAN SIJPH-TERINTEGRASI
## Sistem Informasi Pelayanan Jasa Hukum Terintegrasi

**Dokumen:** Proposal teknis dan rencana pelaksanaan  
**Versi:** 1.0 — rancangan awal untuk pembahasan  
**Tanggal:** 20 Oktober 2026  
**Repositori:** https://github.com/n30AK/SIJPH-TERINTEGRASI  
**Basis data:** Neon PostgreSQL — project `empty-sky-04023805`

---

## 1. Ringkasan Eksekutif

SIJPH-TERINTEGRASI dirancang sebagai platform digital terpadu untuk mengelola layanan jasa hukum dari titik kontak pertama dengan pemohon hingga penyelesaian layanan, pengarsipan, pelaporan, dan evaluasi kinerja. Platform menggabungkan situs publik profesional, portal pemohon, CRM, manajemen perkara/permohonan, antrean loket, monitor ruang tunggu dan digital signage, serta modul administrasi internal.

Sistem akan dibangun secara bertahap dengan prinsip **fitur operasional, bukan sekadar tampilan dashboard**. Setiap modul wajib memiliki alur kerja, formulir, validasi, status, hak akses, riwayat aktivitas, serta laporan yang dapat digunakan. AI ditempatkan sebagai asisten pendukung dengan batasan jelas; keputusan hukum, persetujuan, dan tindakan berisiko tetap dilakukan manusia yang berwenang.

Pembangunan menggunakan repository GitHub yang telah ditentukan dan Neon PostgreSQL. Hosting awal dipilih berdasarkan biaya rendah dan kompatibilitas aplikasi Next.js; domain khusus ditunda hingga tersedia. URL bawaan hosting digunakan untuk tahap awal.

## 2. Latar Belakang dan Permasalahan

Pelayanan jasa hukum biasanya melibatkan banyak proses: pertanyaan awal, pendaftaran pemohon, pengumpulan dokumen, penjadwalan konsultasi, penanganan permohonan/perkara, antrean, komunikasi, pembayaran/administrasi, pelaporan dan pengarsipan. Jika proses terpisah, organisasi berisiko mengalami data ganda, status tidak jelas, keterlambatan, pelaporan manual, dan sulitnya mengukur mutu layanan.

SIJPH-TERINTEGRASI bertujuan menyediakan sumber data yang konsisten, alur layanan yang dapat ditelusuri, pengendalian akses, dan pengalaman yang mudah digunakan melalui web serta layar ruang tunggu.

## 3. Tujuan

1. Mendigitalisasi proses layanan jasa hukum dari intake hingga penutupan.
2. Menyatukan data pemohon, layanan, permohonan/perkara, jadwal, dokumen, antrean dan komunikasi.
3. Menyediakan antrean digital dan monitor ruang tunggu yang aman bagi privasi.
4. Menyediakan CRM dan laporan operasional untuk pimpinan.
5. Menyediakan administrasi keuangan, SDM, persediaan dan perpajakan melalui tahapan implementasi yang terukur.
6. Memanfaatkan AI untuk FAQ, pencarian pengetahuan dan bantuan administrasi secara terkontrol.
7. Menjamin auditabilitas, keamanan, perlindungan data pribadi dan keberlanjutan biaya.

## 4. Ruang Lingkup Sistem

### 4.1 Situs publik dan portal pemohon
- Profil organisasi, jenis layanan, syarat dan alur layanan.
- Formulir pengajuan/permintaan layanan dengan persetujuan privasi.
- Nomor referensi dan pelacakan status setelah autentikasi/validasi yang sesuai.
- Unggah dan pengelolaan dokumen dengan pembatasan akses.
- Jadwal konsultasi, notifikasi, FAQ, dan kanal kontak.

### 4.2 CRM dan manajemen layanan hukum
- Data pemohon/klien dan riwayat interaksi.
- Katalog layanan, SLA/target waktu dan persyaratan.
- Permohonan/perkara, penugasan petugas, checklist, status, catatan dan tenggat.
- Jadwal konsultasi, pengingat dan tindak lanjut.
- Dokumen, versi, kategori, serta jejak akses/perubahan.
- Penutupan layanan, evaluasi kepuasan dan arsip.

### 4.3 Antrean dan ruang tunggu
- Nomor antrean per loket/jenis layanan.
- Panggil, panggil ulang, lewati, layani, selesai dan pembatalan oleh petugas berwenang.
- Layar monitor dengan informasi minimum yang aman.
- Pengumuman dan konten edukasi/digital signage terjadwal.
- Konten iklan/mitra hanya setelah kebijakan editorial dan persetujuan ditetapkan.

### 4.4 AI Assistant dan multi-agent
- Asisten FAQ berbasis sumber pengetahuan yang disetujui.
- Bantuan klasifikasi pertanyaan dan rekomendasi layanan.
- Ringkasan dokumen/riwayat untuk staf yang berwenang.
- Agent khusus pengetahuan, intake, antrean, administrasi, pelaporan, dan dukungan pengguna pada fase berikutnya.
- AI wajib menampilkan batasan, sumber bila tersedia, dan jalur eskalasi ke manusia; tidak memberi kepastian hasil perkara atau menggantikan penasihat hukum.
- Data rahasia tidak dikirim ke penyedia model tanpa dasar pemrosesan, kontrak, dan kontrol yang sesuai.

### 4.5 ERP internal (bertahap)
- Keuangan: anggaran, kas/bank, transaksi, jurnal, piutang/utang dan laporan.
- SDM/HRD: data pegawai, struktur, kehadiran, cuti dan evaluasi.
- Payroll: komponen gaji, persetujuan, slip dan ekspor pembayaran.
- Persediaan/aset: barang, stok, mutasi, inventaris dan pemeliharaan.
- Pajak: pencatatan data pendukung dan ekspor/review; perhitungan wajib diverifikasi tenaga kompeten sesuai aturan berlaku.
- Dashboard pimpinan dan laporan audit.
- Modul ERP tidak dianggap siap hanya karena halaman tersedia; tiap transaksi harus memiliki validasi, otorisasi, pembukuan/jejak audit dan skenario uji.

## 5. Peran dan Hak Akses

Peran awal yang direncanakan: Administrator Sistem, Pimpinan, Supervisor Layanan, Petugas Intake/Front Office, Petugas Hukum, Petugas Antrean, Keuangan, HRD, Auditor/Pembaca, dan Pemohon. Hak akses mengikuti prinsip least privilege, pembatasan per unit/penugasan, serta pemisahan fungsi input–persetujuan untuk transaksi penting.

Semua endpoint internal harus menegakkan otorisasi di server, bukan hanya menyembunyikan tombol pada antarmuka. Data sensitif tidak boleh tersedia melalui endpoint publik.

## 6. Arsitektur Teknologi

- **Frontend dan aplikasi web:** Next.js, React, TypeScript.
- **Backend:** Next.js Route Handlers/server-side services, validasi skema dan transaksi.
- **Database:** Neon PostgreSQL, koneksi melalui variabel rahasia `DATABASE_URL`.
- **Repositori dan CI:** GitHub, pull request, typecheck, build, dan uji otomatis.
- **Hosting:** layanan hosting yang kompatibel dengan Next.js dan menyediakan URL bawaan. Pilihan akhir harus mengikuti ketersediaan akun, kuota paket gratis, dan kebutuhan server-side PostgreSQL; tidak boleh mengasumsikan koneksi hosting sudah aktif.
- **Digital signage:** halaman layar penuh dengan endpoint publik yang hanya menyajikan data yang telah dipublikasikan.
- **AI:** integrasi provider diputuskan setelah kebutuhan, biaya, kebijakan data, dan ketersediaan secret ditetapkan.
- **Observabilitas:** health endpoint, log tanpa data rahasia, pemantauan error, dan pencatatan audit.

Arsitektur awal menggunakan satu aplikasi terstruktur modular, bukan memecah layanan menjadi banyak microservice sebelum skala membutuhkannya.

## 7. Keamanan dan Perlindungan Data

1. Autentikasi, otorisasi berbasis peran, dan perlindungan sesi sebelum portal internal dibuka untuk umum.
2. TLS saat transit, rahasia hanya melalui environment variables/secret manager.
3. Validasi input server-side, pembatasan laju, perlindungan spam, dan pencegahan unggahan berbahaya.
4. Audit trail untuk perubahan data, akses dokumen sensitif dan persetujuan.
5. Kebijakan retensi, penghapusan, pencadangan, pemulihan, dan respons insiden.
6. Persetujuan privasi dicatat dengan versi kebijakan, waktu dan tujuan yang jelas.
7. Layar antrean/signage tidak menampilkan nama lengkap, rincian perkara, atau data sensitif.
8. Peninjauan kepatuhan terhadap UU Pelindungan Data Pribadi dan aturan sektoral yang berlaku oleh penanggung jawab yang kompeten.
9. Data produksi nyata tidak digunakan untuk pengujian tanpa dasar dan pengamanan yang sesuai.

## 8. Tahapan Pelaksanaan dan Keluaran

| Tahap | Fokus | Keluaran / kriteria penerimaan |
|---|---|---|
| 0. Fondasi | Repository, skema awal, dokumentasi, CI | Struktur proyek, migrasi terdokumentasi, build/typecheck berjalan |
| 1. MVP publik | Situs publik, intake, privasi, health | Form tervalidasi, consent tercatat, intake tetap nonaktif sampai kebijakan dan anti-abuse disetujui |
| 2. Identitas & akses | Login, reset, role/permission | Pengujian akses negatif dan positif; endpoint internal terlindungi |
| 3. Layanan/CRM | Klien, katalog, permohonan, penugasan, dokumen | Workflow end-to-end dan audit log teruji |
| 4. Antrean & signage | Tiket, pemanggilan, monitor dan CMS | Operasi petugas terlindungi, layar publik bebas data sensitif |
| 5. Operasional ERP | Keuangan, SDM, payroll, aset, pajak | Rekonsiliasi dan approval; laporan dibandingkan dengan data uji |
| 6. AI terkendali | FAQ berbasis sumber, bantuan staf | Evaluasi akurasi, batasan, eskalasi manusia dan kontrol data |
| 7. Hardening & rilis | Keamanan, performa, backup, UAT | UAT disetujui, rollback diuji, dokumentasi operasi dan pelatihan |

Jadwal kalender dan tim pelaksana final ditetapkan setelah jumlah pengguna, volume layanan, integrasi, persyaratan hukum, ketersediaan staf dan anggaran disepakati. Jadwal tidak boleh dijanjikan tanpa estimasi kapasitas yang nyata.

## 9. Pengujian dan Kriteria Penerimaan

- Instalasi dependensi dan build produksi berhasil.
- TypeScript/typecheck dan lint berjalan; setiap kegagalan dicatat dan ditangani.
- Migrasi dapat diterapkan secara berurutan di environment pengujian dan skema diverifikasi.
- Uji API: validasi, otorisasi, penanganan error, status HTTP dan sanitasi data.
- Uji integrasi database: koneksi nyata ke Neon dan operasi baca/tulis dengan data uji.
- Uji keamanan: akses tanpa login, eskalasi hak akses, injeksi, spam dan kebocoran data.
- Uji end-to-end: permintaan layanan → triase → penugasan → proses → penutupan.
- Uji antrean: tiket dibuat, dipanggil, dilayani, selesai, dan tampilan monitor diperbarui.
- Uji backup/restore, performa dasar dan penggunaan pada perangkat mobile.
- UAT ditandatangani pemilik proses sebelum peluncuran produksi.

Deployment hanya dinyatakan berhasil setelah URL benar-benar dapat diakses, build berstatus berhasil, health endpoint mengonfirmasi koneksi database, dan smoke test aplikasi lolos.

## 10. Rencana Deployment dan Operasi

1. Pilih hosting paling ekonomis yang kompatibel berdasarkan akun aktif dan batas paket; jangan mengasumsikan layanan gratis selamanya.
2. Hubungkan repository GitHub ke hosting dan gunakan URL bawaan.
3. Pasang `DATABASE_URL` sebagai secret server-side; jangan commit string koneksi atau password.
4. Terapkan migrasi yang telah ditinjau, bukan mengubah skema produksi secara manual tanpa rekam jejak.
5. Jalankan build, cek log, health check dan smoke test.
6. Pertahankan intake publik nonaktif sampai kebijakan privasi, anti-spam, akses dokumen dan penanggung jawab data disahkan.
7. Siapkan prosedur rollback, backup, rotasi rahasia dan pemantauan.
8. Domain khusus dapat dihubungkan kemudian tanpa mengubah basis data utama.

## 11. Estimasi Biaya

Karena skala, jumlah pengguna, volume dokumen, SLA, kebutuhan AI, integrasi dan target waktu belum dikonfirmasi, angka rupiah final tidak layak ditetapkan dalam proposal awal ini. Estimasi anggaran harus memisahkan:

- Pengembangan dan pengujian.
- Desain UI/UX dan aksesibilitas.
- Infrastruktur hosting, database, penyimpanan dan backup.
- Autentikasi, email/SMS/WhatsApp atau gateway notifikasi.
- Penggunaan model AI dan penyimpanan knowledge base.
- Keamanan, audit, pelatihan, migrasi data dan dukungan operasional.
- Pajak, pemeliharaan, serta cadangan risiko.

Strategi awal: menggunakan free tier yang sesuai untuk prototipe dan data uji, membatasi penggunaan AI berbiaya, dan tidak memasukkan data sensitif/produksi sebelum kontrol keamanan siap. Paket gratis mempunyai kuota, batas penggunaan dan kemungkinan perubahan kebijakan; biaya aktual perlu diperiksa di akun masing-masing sebelum komitmen.

## 12. Risiko dan Mitigasi

- **Kebocoran data hukum:** akses least-privilege, audit, enkripsi, minimisasi data dan review keamanan.
- **Klaim AI tidak akurat:** sumber terkurasi, disclaimer, evaluasi dan eskalasi manusia.
- **Biaya cloud meningkat:** batas kuota, alert, penggunaan terukur dan opsi ekspor data.
- **Ketergantungan provider:** migrasi database standar PostgreSQL, dokumentasi deployment dan backup.
- **Kegagalan build/integrasi:** CI, lingkungan staging, tes otomatis dan rollback.
- **Proses bisnis belum jelas:** lokakarya kebutuhan dan persetujuan SOP sebelum modul dinyatakan selesai.
- **Klaim kepatuhan berlebihan:** review hukum/privasi profesional sebelum produksi.

## 13. Tata Kelola dan Keputusan yang Dibutuhkan

Sebelum produksi, organisasi perlu menunjuk pemilik produk, penanggung jawab data, administrator sistem, approver transaksi, serta petugas yang bertanggung jawab atas kebijakan privasi dan konten signage. Organisasi perlu menyetujui SOP layanan, matriks hak akses, retensi data, kebijakan AI, kategori dokumen, target SLA, dan kriteria UAT.

## 14. Penutup

SIJPH-TERINTEGRASI akan dikembangkan secara bertahap dengan prioritas pada proses layanan yang nyata, keamanan data, biaya terkendali, dan hasil yang dapat diuji. Keberhasilan bukan diukur dari banyaknya menu, melainkan dari workflow yang berjalan, integrasi yang terbukti, laporan yang dapat direkonsiliasi, dan pengguna yang menerima sistem setelah UAT.

**Catatan status:** dokumen ini adalah proposal awal. Ini bukan pernyataan bahwa seluruh modul telah selesai, lolos pengujian, atau sudah live. Status build, integrasi Neon dan deployment harus dibuktikan melalui hasil pemeriksaan aktual.
