# Legal Knowledge API — fase awal

## Konfigurasi
- `DATABASE_URL`: hanya server-side, koneksi TLS.
- `SIJPH_ADMIN_API_KEY`: secret acak kuat yang hanya disimpan di environment server/hosting. Jangan masukkan ke source code, browser, commit, atau log.
- Semua endpoint admin mengharuskan header `x-sijph-admin-key`. Rotasi key dan akses pengguna berperan harus ditambahkan sebelum penggunaan multi-staf/produksi.

## Endpoint
- `GET /api/admin/legal/sources` — daftar registry (maksimum 500).
- `POST /api/admin/legal/sources` — validasi dan simpan metadata sumber.
- `POST /api/admin/legal/documents` — simpan metadata dokumen, versi, teks hasil ekstraksi, dan daftar pasal secara transaksional. Status dokumen/versi selalu dimulai `unverified`/`pending`; endpoint tidak otomatis mengesahkan sumber.
- `POST /api/admin/legal/search` — pencarian pasal berbasis teks. Default hanya menampilkan dokumen berstatus in-force, versi terverifikasi, sumber primer, dan pemeriksaan status dalam 180 hari terakhir.
- `includeUnverified: true` hanya untuk review internal; hasil harus dianggap belum final.

## Contoh payload pencarian
```json
{ "query": "perjanjian", "limit": 10 }
```

## Batasan penting
- Registry sumber tidak berarti seluruh peraturan sudah diindeks.
- Seed sumber resmi hanya menyimpan metadata endpoint; tidak melakukan scraping atau bulk download.
- Status hukum harus diverifikasi terhadap sumber primer dan perubahan/putusan terkait. Batas 180 hari adalah filter konservatif untuk pencarian, bukan pengganti verifikasi aktual.
- API key bersama adalah gerbang administratif awal, bukan sistem identitas/RBAC lengkap. Jangan gunakan untuk membuka akses ke browser publik.
- Belum ada RAG semantik, orkestrasi model, citation pinpoints otomatis, ingestion scheduler, atau human-review UI dalam fase ini.
- Jangan memasukkan data kasus klien ke pencarian registry global.


## Contoh ingest metadata dokumen
`POST /api/admin/legal/documents` menerima `sourceId`, metadata dokumen, label versi, URL sumber asli, metode ekstraksi, dan daftar `provisions`. Gunakan UUID sumber yang dikembalikan registry API. Jangan mengirim dokumen rahasia klien ke registry pengetahuan global.

Semua dokumen yang masuk tetap berstatus `unverified` dan versinya `pending`. Verifikasi editorial dan proses perubahan status belum memiliki antarmuka persetujuan khusus; jangan mengubah status hanya untuk membuat hasil muncul pada pencarian default.
