# API Antrean dan Digital Signage

Dokumen ini mendeskripsikan fondasi API vendor-netral untuk integrasi perangkat antrean dan layar. Implementasi endpoint tersedia pada branch fitur; integrasi printer, tombol fisik, speaker, TV player, serta CMS visual belum termasuk.

## Autentikasi admin

Endpoint administratif menggunakan header `x-sijph-admin-key` yang dibandingkan secara constant-time dengan secret server `SIJPH_ADMIN_API_KEY`. Jangan masukkan key ini ke JavaScript browser, aplikasi display, source control, atau tiket dukungan. Karena saat ini key bersifat bersama dan belum terikat identitas pengguna, endpoint ini belum menyediakan pemisahan hak berbasis peran maupun jejak identitas approver. Gunakan hanya pada jaringan admin tepercaya sampai autentikasi per pengguna tersedia.

## Antrean

### Daftar tiket
`GET /api/admin/queue?status=waiting&limit=50`

- Header: `x-sijph-admin-key`
- Filter status opsional: `waiting | called | serving | skipped | completed | cancelled`
- Batas hasil 1–100.
- Data pengenal klien sensitif tidak dikembalikan; feed memuat nomor tiket, status, layanan, loket, label pengunjung, dan timestamp.

### Buat tiket
`POST /api/admin/queue`

Contoh body:

```json
{
  "visitorLabel": "Pengunjung A",
  "priority": "normal"
}
```

Field opsional: `serviceId`, `counterId`, `clientId`. `priority` dapat bernilai `normal` atau `priority`. Nomor tiket dihitung per tanggal WIB di dalam transaksi dengan advisory lock. Endpoint ini masih administratif; mesin tiket publik dan rate limiting khusus belum disediakan.

### Ubah status tiket
`PATCH /api/admin/queue`

```json
{
  "ticketId": "UUID-TIKET",
  "action": "call",
  "counterId": "UUID-LOKET"
}
```

Aksi yang didukung: `call`, `start`, `skip`, `complete`, `cancel`. Transisi ilegal menghasilkan HTTP 409. Perangkat vendor dapat menjadi adapter ke endpoint ini setelah protokol/model perangkat ditentukan.

## Digital signage

### Kelola konten
- `GET /api/admin/signage` — daftar maksimal 200 konten.
- `POST /api/admin/signage` — membuat konten berstatus `draft`.
- `PATCH /api/admin/signage` — transisi status konten.

Body pembuatan:

```json
{
  "screenId": "UUID-LAYAR",
  "title": "Informasi layanan",
  "contentType": "announcement",
  "body": "Silakan menunggu nomor antrean Anda.",
  "durationSeconds": 15,
  "sortOrder": 100
}
```

Jenis konten: `announcement`, `image`, `video`, `education`, `advertisement`. Status mengikuti alur `draft → pending_review → approved → published`, dengan opsi pause/resume dan reject. Karena admin key belum mengidentifikasi pengguna, tahap persetujuan saat ini adalah kontrol alur status, bukan bukti identitas pejabat penyetuju.

### Feed playback layar
`GET /api/signage/{code}`

Header: `x-sijph-screen-token: <token-rahasia>`.

Server menyimpan SHA-256 heksadesimal token pada `signage_screens.screen_token_hash`, bukan token mentah. Buat token acak minimal 24 karakter melalui password manager/secret generator, hitung SHA-256 heksadesimalnya di lingkungan server tepercaya, lalu simpan hash tersebut untuk kode layar yang aktif. Jangan menyimpan token mentah di repository atau database. Endpoint hanya mengembalikan item berstatus `published` dalam jadwal yang berlaku dan memperbarui `last_seen_at`.

Feed tidak menyertakan admin key. Simpan token layar pada perangkat display melalui konfigurasi lokal yang terlindungi dan rotasi bila perangkat hilang.

## Batasan sebelum go-live

1. Belum ada UI CMS/operator, WebSocket/SSE, atau tampilan panggilan nomor realtime; display client perlu melakukan polling secara konservatif.
2. Belum ada rate limiting terdistribusi, login admin per pengguna, RBAC yang ditegakkan di endpoint, atau audit-event lengkap untuk perubahan status.
3. Belum ada adapter printer, speaker, kiosk, tombol loket, TV/Android player, atau perangkat vendor tertentu.
4. Perlu pengujian integrasi PostgreSQL, beban serentak, keamanan, aksesibilitas, pemulihan backup, dan uji penerimaan di lokasi.
5. Endpoint ini tidak mengubah status kesiapan produksi dan tidak mengaktifkan permohonan publik.
