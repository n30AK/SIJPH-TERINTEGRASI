# Human Review API

Endpoint ini menyediakan antrean analisis AI dan pencatatan keputusan reviewer. Keduanya dilindungi oleh `SIJPH_ADMIN_API_KEY` melalui header `x-sijph-admin-key`; jangan menaruh kunci ini di browser, aplikasi klien, atau repositori.

## Daftar antrean

```http
GET /api/admin/legal/review?status=needs_human_review&limit=20
x-sijph-admin-key: <secret>
```

Status filter yang diizinkan: `needs_human_review`, `queued`, `running`, `approved`, `rejected`, `failed`. Batas hasil 1–50. Respons dapat memuat output analisis; batasi akses dan jangan meneruskan data pribadi yang tidak diperlukan.

## Simpan keputusan reviewer

```http
POST /api/admin/legal/review
content-type: application/json
x-sijph-admin-key: <secret>

{
  "runId": "UUID-ANALISIS",
  "reviewerUserId": "UUID-USER-REVIEWER",
  "decision": "revision_requested",
  "notes": "Periksa kembali status peraturan dan lengkapi sumber primer."
}
```

Keputusan: `approved`, `rejected`, atau `revision_requested`. Reviewer harus sudah terdaftar pada `app_users`. Persetujuan menghasilkan status `approved`; penolakan menghasilkan `rejected`; revisi mempertahankan status antrean `needs_human_review` dan mencatat keputusan `revision_requested`.

## Batasan penting

- Endpoint memeriksa peran reviewer/admin/super_admin dan mencatat keputusan ke audit log. Namun, header API key tetap menjadi gerbang administratif bersama; sebelum produksi, ganti/komplemen dengan sesi autentikasi individual, kebijakan RBAC terpusat, serta uji pembatasan organisasi dan perkara.
- Header API key adalah kontrol administratif sementara, bukan pengganti sesi pengguna yang terautentikasi dan RBAC.
- Jangan menandai analisis sebagai benar hanya karena disetujui; verifikasi sumber primer, tanggal/status berlaku, kutipan, fakta, yurisdiksi, dan ketidakpastian secara terpisah.
- API tidak mengirim jawaban AI kepada klien akhir dan tidak membuat klaim tentang peluang menang.
