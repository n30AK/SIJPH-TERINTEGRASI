# Runbook Bundle Installer Offline SIJPH-TERINTEGRASI

**Status:** implementasi awal paket dan prosedur; belum menjadi sertifikasi installer atau bukti uji instalasi di mesin klien.

## Tujuan dan batas
Bundle dibuat pada mesin build yang memiliki Docker dan internet. Bundle kemudian memuat image aplikasi, image PostgreSQL, Compose file, migrasi database awal, skrip instalasi, checksum, dan panduan sehingga target dapat dipasang tanpa menarik image dari registry.

Instalasi offline tidak berarti semua fitur berjalan tanpa internet. AI eksternal, website publik, email/SMS, sinkronisasi cloud, pembaruan, DNS, dan TLS publik mungkin memerlukan jaringan. Aplikasi tetap harus diuji pada OS dan arsitektur server yang benar-benar digunakan klien.

## Prasyarat mesin build
- Docker Engine dan Docker Compose v2.
- Bash, Git (opsional untuk memberi versi dari commit), tar, dan sha256sum.
- Akses internet saat membuat bundle untuk mengambil base image dan dependency build.
- Ruang disk memadai untuk image aplikasi, PostgreSQL, dan archive hasil export.

## Membuat bundle
Dari root repository pada branch/release yang ingin dipaketkan:

    bash scripts/build-offline-bundle.sh <versi-release>

Secara default output ditulis ke `dist/offline/`. Hasilnya:
- `sijph-terintegrasi-offline-<versi>.tar.gz`
- file sidecar `.sha256` untuk memeriksa archive ketika dipindahkan.

Skrip membangun image aplikasi, mengambil image PostgreSQL, menyimpan kedua image ke `images.tar`, memasukkan migrasi dan konfigurasi deployment, lalu membuat checksum isi bundle. Gunakan versi yang jelas dan simpan artefak serta commit SHA yang cocok untuk audit.

## Rilis bundle melalui GitHub Actions

Workflow `.github/workflows/offline-bundle-release.yml` disiapkan untuk membangun bundle pada tag versi `v*` atau melalui `workflow_dispatch`. Setelah workflow lulus, bundle dan checksum diterbitkan sebagai aset GitHub Release. Workflow belum membuktikan instalasi di server klien; verifikasi checksum, instalasi bersih offline, backup/restore, dan acceptance test tetap wajib.

Untuk rilis bertag, buat dan push tag versi hanya setelah commit yang dimaksud ditinjau dan CI lulus. Jangan membuat tag rilis produksi hanya untuk menguji workflow pada kode yang belum diterima.

## Memindahkan dan memasang
1. Salin archive dan sidecar checksum ke server institusi melalui media yang disetujui.
2. Verifikasi integritas archive sebelum mengekstrak:

       sha256sum -c sijph-terintegrasi-offline-<versi>.tar.gz.sha256

3. Ekstrak ke direktori instalasi khusus yang hanya dapat diakses administrator:

       mkdir -p sijph-install
       tar -xzf sijph-terintegrasi-offline-<versi>.tar.gz -C sijph-install
       cd sijph-install

4. Jalankan:

       bash scripts/install-offline-bundle.sh

5. Masukkan nama pengendali data dan email kontak privasi. Installer membuat secret awal acak dan file `.env` dengan izin terbatas. Jangan mengirim atau commit file tersebut.
6. Periksa container dan log:

       docker compose ps
       docker compose logs --tail=200 app
       docker compose logs --tail=200 db
       curl -i http://127.0.0.1:3000/api/ready

7. Simpan bukti hasil instalasi yang telah disanitasi. Jangan menandai sistem siap produksi hanya karena container berjalan.

## Database dan migrasi
Migrasi di `database/migrations` dipasang ke mekanisme init PostgreSQL. Image resmi PostgreSQL hanya menjalankan file init saat data directory baru/kosong. File init bukan mekanisme upgrade untuk database yang sudah ada. Untuk setiap versi berikutnya, siapkan migrasi terurut dan backward-compatible, backup, dry run/staging, pemeriksaan hasil, serta rollback. Jangan hapus volume database untuk memaksa migrasi ulang.

Sebelum dipakai dengan data nyata:
- konfirmasi seluruh migrasi berhasil dan schema readiness sesuai;
- tetapkan backup terenkripsi, retensi, lokasi salinan kedua, RPO/RTO, dan lakukan uji restore;
- buat prosedur upgrade versi dan rollback yang sesuai perubahan schema;
- tetapkan owner database dan akun aplikasi dengan privilege minimum.

## Jaringan dan keamanan
- Compose mengikat port aplikasi ke `127.0.0.1` secara default. Jangan langsung memublikasikan port 3000 ke internet.
- Untuk akses LAN/WAN, konfigurasi reverse proxy HTTPS yang dikelola institusi, firewall allowlist, DNS, sertifikat, serta kebijakan akses yang disetujui.
- PostgreSQL tidak memublikasikan port ke host pada konfigurasi awal; aplikasi mengaksesnya di private Docker network.
- Public intake tetap nonaktif. Jangan mengaktifkannya sebelum review privasi, perlindungan spam/rate limit, pemberitahuan privasi, dan prosedur penanganan permohonan disetujui.
- AI tidak berfungsi sampai provider, model, dan API key yang disetujui dikonfigurasi. Simpan key di secret store atau file konfigurasi yang dilindungi; jangan commit atau mengirimnya lewat chat.
- Aplikasi memuat database dan server secrets; batasi akses administrator server dan backup.
- Periksa lisensi, SBOM, vulnerability scan, dan update security base images sebelum distribusi komersial.

## Kriteria penerimaan sebelum produksi
- Instalasi pada server bersih tanpa internet berhasil dari bundle yang checksum-nya valid.
- Container aplikasi dan database sehat; migrasi awal selesai dan schema telah diperiksa.
- Reboot server tidak menghilangkan database; restart service tidak menghasilkan duplikasi data.
- Backup dan restore dibuktikan di lingkungan uji.
- Akses aplikasi hanya melalui jaringan/HTTPS yang disetujui; tidak ada port database terbuka.
- Admin bootstrap, autentikasi, otorisasi, audit, privasi, dan pemulihan insiden telah diuji.
- AI, signage, queue, printer/speaker, dan perangkat fisik diuji secara terpisah sesuai fitur yang dinyatakan aktif.
- Klien menyetujui hasil uji dan prosedur operasi.

## Batas saat ini
Skrip ini menyiapkan fondasi bundling dan startup container. Ia belum melakukan instalasi reverse proxy/TLS, belum memverifikasi seluruh migrasi pada server bersih, belum membuat backup policy otomatis, belum menambahkan upgrade/rollback orchestrator, dan belum mengimplementasikan signage CMS atau hardware queue adapter. Semua itu harus diselesaikan dan diuji sebelum klaim produksi.
