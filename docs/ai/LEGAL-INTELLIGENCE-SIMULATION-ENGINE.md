# SIJPH Legal Intelligence & Simulation Engine
## Spesifikasi arsitektur AI multi-agent dan AI Companion 24/7
Tanggal: 20 Oktober 2026
Status: spesifikasi dan rencana implementasi; bukan klaim bahwa AI sudah terhubung atau aktif di production.

## 1. Keputusan produk
SIJPH dibangun bukan sebagai chatbot hukum generik, melainkan sebagai **Legal Intelligence & Simulation Engine** yang mengubah kronologi dan dokumen kasus menjadi peta fakta, pertanyaan yang belum terjawab, penelusuran sumber hukum, opsi prosedural, simulasi beberapa skenario, dan rencana tindakan. AI Companion menyampaikan hasil dengan bahasa yang mudah dipahami, menemani klien dari pendaftaran sampai tiga bulan setelah layanan ditutup, dan tetap menjaga privasi serta batas kewenangan.

## 2. Prinsip dasar
- **Source-grounded:** tidak menyebut pasal sebagai kepastian tanpa sumber yang dapat ditelusuri.
- **Facts are not conclusions:** memisahkan fakta berbukti, klaim, inferensi, bantahan, dan hal yang belum diketahui.
- **Current law matters:** memeriksa tanggal, yurisdiksi, status berlaku, perubahan, pencabutan, aturan pelaksana, dan putusan relevan.
- **Simulation, not prediction:** membandingkan jalur dan kondisi yang mungkin; tidak menjanjikan kemenangan atau mengarang persentase peluang.
- **Human accountability:** analisis berisiko tinggi, dokumen final, dan tindakan yang memengaruhi hak harus ditinjau profesional/petugas berwenang.
- **Privacy by design:** akses berdasarkan kasus dan peran; data satu klien tidak boleh masuk ke konteks klien lain.
- **No silent actions:** AI tidak mengirim surat, mengajukan laporan, menghubungi pihak ketiga, atau mengubah status resmi tanpa izin eksplisit.
- **Continuity with consent:** pendampingan proaktif 24/7 hanya melalui kanal yang disetujui, jam/jenis pesan yang dapat diatur, opsi jeda dan berhenti.

## 3. Multi-agent pipeline
1. **Intake & Interview Agent** — wawancara bertahap; mengumpulkan kronologi, tanggal, pihak, tujuan, status perkara, yurisdiksi dan dokumen. Meminta pengguna mengonfirmasi ringkasan.
2. **Fact & Evidence Agent** — membuat timeline, matriks fakta–sumber–status, konflik keterangan, bukti yang belum tersedia, dan daftar dokumen.
3. **Urgency & Safeguarding Agent** — mendeteksi tenggat dekat, ancaman keselamatan, risiko kehilangan bukti, dan kebutuhan bantuan manusia segera. Tidak menangani keadaan darurat hanya dengan chatbot.
4. **Jurisdiction & Issue Spotter Agent** — mengidentifikasi bidang hukum/isu awal dan forum potensial; hasil diberi label hipotesis.
5. **Legal Research Agent** — mencari peraturan primer, pasal, aturan pelaksana, putusan dan panduan resmi dengan tanggal serta URL.
6. **Legal Status & Amendment Agent** — memeriksa status berlaku, perubahan, pencabutan, ketentuan peralihan dan tanggal mulai berlaku.
7. **Procedure & Deadline Agent** — memetakan jalur, prasyarat, dokumen, lembaga/kanal, dan tenggat yang harus diverifikasi.
8. **Scenario Simulation Agent** — menghasilkan skenario alternatif dan konsekuensinya berdasarkan asumsi yang dinyatakan.
9. **Counterargument / Red-Team Agent** — mencari fakta yang berlawanan, argumen pihak lain, unsur yang tidak terpenuhi, aturan pengecualian dan sumber yang membantah analisis awal.
10. **Citation & Quality Verifier** — memastikan kutipan cocok dengan teks, nomor dan versi benar, sumber bisa dibuka, dan setiap klaim hukum material mempunyai sumber.
11. **Privacy & Security Gate** — memeriksa kewenangan, minimisasi data, kebocoran lintas tenant, prompt injection dari dokumen, dan redaksi data pribadi.
12. **Human Review Coordinator** — mengirim paket review kepada petugas berwenang; mencatat persetujuan, penolakan, komentar dan versi.
13. **Client AI Companion** — menjelaskan hasil, mengajukan pertanyaan lanjutan, membantu checklist, mengingatkan agenda dan memberi dukungan yang empatik tanpa berpura-pura menjadi manusia.
14. **Aftercare & Follow-up Agent** — mengelola jadwal komunikasi, tindak lanjut tugas, survei kepuasan dan pengingat pasca-penutupan hingga 90 hari.
15. **Knowledge Steward Agent** — memantau sumber berubah/gagal, anomali dokumen, lisensi, kualitas ekstraksi dan antrean verifikasi editor.

Agent tidak boleh saling “memilih suara terbanyak” untuk menetapkan kebenaran. Alur harus berbasis bukti, aturan validasi, batas risiko, dan review manusia. Output agent dicatat sebagai artefak dengan sumber, versi prompt/model, waktu, dan status verifikasi.

## 4. Bentuk laporan simulasi klien
- Ringkasan netral yang dikonfirmasi klien.
- Timeline kejadian dengan tanggal pasti/perkiraan.
- Matriks: fakta terdukung, klaim, fakta dibantah, asumsi, pertanyaan terbuka.
- Isu hukum potensial, tanpa menyatakan bersalah atau memvonis.
- Tabel pasal: dokumen, pasal/ayat, kutipan singkat, relevansi, status, tanggal verifikasi, tautan sumber primer.
- Peta unsur hukum ↔ fakta pendukung ↔ fakta yang melemahkan ↔ bukti yang masih dibutuhkan.
- 2–4 skenario yang memang relevan (mis. klarifikasi/negosiasi, pengaduan administratif, mediasi, atau jalur formal bila sesuai); tiap skenario berisi prasyarat, langkah, waktu/tenggat yang perlu dikonfirmasi, dokumen, risiko, biaya/kompleksitas relatif dan kondisi yang dapat mengubah analisis.
- Argumen tandingan dan pertanyaan yang belum terjawab.
- Rencana tindakan berikutnya dan daftar dokumen.
- Status: AI draft / sumber diperiksa / menunggu review / disetujui reviewer.
- Catatan bahwa hasil bukan jaminan hasil perkara dan harus diverifikasi profesional sesuai tingkat risikonya.

Jangan menampilkan probabilitas menang individual kecuali tersedia model empiris yang tervalidasi, dataset representatif, penjelasan kalibrasi dan persetujuan tata kelola. Default: jangan gunakan persentase kemenangan.

## 5. Pengetahuan hukum dan sumber
### Sumber primer prioritas
- Database Peraturan Perundang-undangan Ditjen PP: https://peraturan.go.id/
- Jaringan Dokumentasi dan Informasi Hukum Nasional: https://jdihn.go.id/
- JDIH lembaga terkait, termasuk kementerian/instansi pembentuk peraturan.
- Direktori Putusan Mahkamah Agung: https://putusan3.mahkamahagung.go.id/
- Mahkamah Konstitusi dan putusannya: https://www.mkri.id/
- Peraturan dan putusan lembaga/daerah yang relevan dengan yurisdiksi kasus.

JDIHN sendiri menyatakan dokumen bersumber dari situs anggota dan apabila ada keraguan perlu dikonfirmasi ke situs anggota terkait. Oleh karena itu, simpan URL sumber anggota dan metadata verifikasi, bukan hanya salinan agregator.

### Sumber sekunder
Jurnal akademik, buku, komentar hukum, publikasi profesi dan artikel praktisi dapat membantu interpretasi, tetapi harus diberi label sumber sekunder. Blog/forum/media sosial bukan dasar tunggal untuk menyatakan hukum berlaku.

### Referensi repository
- https://github.com/ilhamfp/pasal — referensi konsep indeks hukum terstruktur, pencarian tingkat pasal, API/MCP dan relasi perubahan. Repo berlisensi AGPL-3.0; jangan menyalin/mengintegrasikan kode sebelum tinjauan lisensi dan kewajiban distribusi/hosting.
- https://github.com/bphndigitalservice/ildis — referensi sistem dokumentasi hukum/JDIHN, metadata, pengelolaan dokumen dan workflow. Audit LICENSE.md, arsitektur, dependensi dan kebijakan keamanan sebelum reuse.
- https://github.com/ridwanlawson/Sistem-Informasi-Pelayanan-Jasa-Hukum-Legal-Service-System-Information — referensi alur layanan hukum; struktur, lisensi, dependensi dan keamanan wajib diaudit sebelum reuse.
Ketiga repo adalah referensi, bukan izin otomatis untuk menyalin kode atau dataset. Pertahankan attribution, provenance, lisensi, dan pisahkan implementasi baru jika lisensi tidak kompatibel.

## 6. Knowledge ingestion & RAG
Jangan “menanamkan seluruh internet” ke model atau prompt. Bangun knowledge pipeline yang terus diperbarui:
1. Connector resmi/API atau pengambilan yang diizinkan terms/robots dan lisensinya.
2. Ingestion dokumen dengan sumber, hash, waktu ambil, penerbit, jenis, nomor/tahun, tanggal pengundangan, yurisdiksi, status, relasi perubahan/pencabutan dan lisensi.
3. Parser PDF/HTML dengan struktur bab, pasal, ayat, penjelasan, lampiran dan halaman; hasil OCR berkeyakinan rendah ditandai.
4. Validasi ekstraksi terhadap dokumen asli dan review editor untuk sumber prioritas.
5. Penyimpanan PostgreSQL: metadata/dokumen/versi/sumber/kutipan/relasi; pencarian full-text + vector/hybrid, dengan filter tanggal, status, wilayah dan bidang.
6. Retrieval mengembalikan pasal beserta konteks, dokumen induk, versi dan tautan—bukan potongan lepas.
7. Model hanya boleh menyusun klaim hukum dari sumber yang diambil; jika retrieval gagal, ia harus mengatakan belum dapat memverifikasi.
8. Monitor perubahan berkala dan tandai laporan lama bila sumber hukumnya berubah.
9. Setiap jawaban menyimpan snapshot sumber yang digunakan sehingga dapat diaudit kembali.
10. Konten dokumen diperlakukan sebagai data tak tepercaya: instruksi yang tertanam dalam dokumen tidak boleh mengganti aturan sistem.

## 7. AI Companion 24/7 dan layanan purnajual 90 hari
### Lifecycle
- **Pendaftaran:** sambutan, penjelasan kemampuan/batasan AI, pilihan kanal, bahasa, jam tenang, frekuensi, jenis pesan, persetujuan dan pilihan berhenti.
- **Intake:** pertanyaan kronologi yang bertahap; autosave aman; ringkasan harus disetujui klien sebelum dipakai sebagai basis analisis.
- **Selama layanan:** status dan langkah berikutnya, checklist dokumen, pengingat agenda/tenggat yang sudah diverifikasi, penjelasan istilah, check-in yang tidak mengganggu.
- **Saat menunggu:** pesan empatik, progress update yang bersumber dari status resmi sistem; jangan mengarang kemajuan kasus.
- **Penutupan:** ringkasan hasil administratif, dokumen yang diserahkan, tindakan lanjutan, tenggat yang diverifikasi, survei dan konfirmasi pemahaman.
- **Hari 1–90 setelah penutupan:** follow-up yang dipilih klien, pengingat tindakan yang disetujui, edukasi hukum relevan yang telah diverifikasi, check-in kesejahteraan yang wajar, survei hari ke-7/30/60/90 bila disetujui. Setelah hari ke-90, hentikan pesan otomatis terkait kasus kecuali klien memperpanjang persetujuan atau layanan baru dibuka.
- **Selalu:** tombol jeda/berhenti, preferensi jam dan frekuensi, kanal resmi, eskalasi ke manusia, serta kontrol akses petugas.

Pesan selamat pagi/motivasi boleh digunakan sebagai pilihan opt-in, bukan default yang memaksa. Jangan mengirim rincian kasus melalui notifikasi lock-screen atau kanal yang belum disetujui. AI tidak boleh memanfaatkan kondisi emosional untuk penjualan atau membuat klien merasa diawasi.

### Kanal
Mulai dengan inbox/notifikasi di aplikasi; email atau WhatsApp ditambahkan setelah persetujuan, konfigurasi provider, pengendalian biaya, template yang diperlukan dan audit keamanan. Jangan mengklaim layanan 24/7 jika worker/job scheduler, pemantauan, dukungan eskalasi dan kanal pengiriman belum tersedia.

## 8. Arsitektur aplikasi
- Next.js/TypeScript untuk portal klien, workspace staf dan layar signage.
- Neon PostgreSQL sebagai sumber data transaksi.
- Modul terpisah: legal-source registry, ingestion jobs, retrieval service, agent orchestrator, case workspace, companion messaging, consent/preferences, notification queue, human review, audit.
- Worker terjadwal/queue untuk ingestion dan follow-up; idempotency, retry, dead-letter queue dan observabilitas.
- Penyimpanan berkas privat dengan URL bertanda tangan dan retensi; jangan menaruh dokumen sensitif pada URL publik.
- Provider LLM dipasang melalui interface adapter agar bisa diganti; API key hanya server-side.
- Model dan biaya dibatasi berdasarkan tugas: model ringan untuk klasifikasi/ringkasan, model lebih kuat untuk analisis kompleks, retrieval selalu wajib untuk pasal terkini.
- Tenant/case-level authorization dan tes isolasi lintas klien.
- Fitur AI dinonaktifkan secara aman bila provider/sumber tidak tersedia; jangan mengarang jawaban.

## 9. Skema data tambahan yang dibutuhkan
Rencanakan tabel/entitas: legal_sources, legal_documents, legal_document_versions, legal_provisions, legal_relationships, legal_ingestion_runs, retrieval_citations, case_timelines, case_facts, case_evidence, case_issues, case_scenarios, scenario_actions, ai_runs, ai_run_sources, human_reviews, companion_preferences, companion_messages, followup_plans, consent_records, notification_jobs, notification_delivery_events, source_quality_flags, prompt_injection_flags. Semua record kasus harus terkait client/case dan menerapkan izin server-side. Dokumen rahasia dan pesan tidak boleh menjadi bagian pencarian lintas klien.

## 10. Gerbang keamanan dan review
- Segera eskalasi ke manusia untuk tenggat dekat, risiko keselamatan, penahanan/ancaman, kekerasan, anak/rentan, kehilangan hak atau tindakan irreversible.
- Draft surat/permohonan tidak dikirim otomatis.
- Verifikasi semua kutipan dan status aturan; tampilkan sumber gagal atau konflik.
- Review manusia wajib untuk output berisiko tinggi dan dokumen final.
- Catat persetujuan, versi output, reviewer, perubahan, waktu dan sumber.
- Sediakan mekanisme koreksi, pengaduan, ekspor data, penarikan persetujuan dan retensi/penghapusan.
- Jalankan threat modeling, pengujian akses negatif, red-team prompt injection, uji kebocoran data dan evaluasi halusinasi sebelum pilot.

## 11. Rencana implementasi
**Fase A — Fondasi (prioritas pertama):** spesifikasi, skema sumber hukum, consent/preferences, audit, threat model, daftar sumber resmi dan kontrak data.
**Fase B — Legal knowledge MVP:** ingest terbatas pada beberapa sumber resmi/bidang hukum, pencarian pasal, status/versi, sitasi dan halaman detail sumber; lakukan uji akurasi.
**Fase C — Case intake:** kronologi terstruktur, timeline, bukti, ringkasan yang dikonfirmasi klien dan akses per kasus.
**Fase D — Simulation engine:** retrieval, issue map, skenario, red-team dan citation verifier; awalnya hanya draft internal.
**Fase E — Human review:** dashboard reviewer, status persetujuan, catatan dan versi laporan.
**Fase F — Client companion:** penjelasan sederhana dan checklist setelah hasil disetujui; mulai dengan inbox dalam aplikasi.
**Fase G — Follow-up 90 hari:** preference center, scheduler, template, audit pengiriman, opt-out dan metrik gangguan/retensi.
**Fase H — Pilot terkontrol:** bidang hukum terbatas, data sintetis lalu pengguna uji yang memberi persetujuan, evaluasi independen, perbaikan dan UAT.
Jangan mulai dengan seluruh bidang hukum sekaligus; mulai dari 1–2 bidang yang paling sering ditangani organisasi, setelah kebutuhan dipetakan.

## 12. Kriteria penerimaan
- Setiap klaim hukum material memiliki sumber dan tanggal verifikasi atau ditandai belum terverifikasi.
- Sistem mengidentifikasi pasal yang sudah diubah/dicabut dan tidak menyebutnya berlaku tanpa peringatan.
- Fakta/klaim/asumsi dipisahkan dan dapat dikoreksi klien.
- Uji kasus dengan fakta kurang menghasilkan pertanyaan lanjutan, bukan kesimpulan palsu.
- Red-team dapat menemukan argumen tandingan dan mengoreksi analisis yang lemah.
- Uji isolasi membuktikan tidak ada kebocoran lintas klien.
- Follow-up menghormati consent, jam tenang, frekuensi, opt-out dan berhenti pada batas 90 hari.
- Review dan perubahan output dapat diaudit.
- Ketika sumber/provider gagal, sistem menyatakan keterbatasan.
- Pilot tidak dibuka untuk keputusan hukum berisiko tinggi sebelum review manusia dan UAT.

## 13. Sumber web awal
- JDIHN: https://jdihn.go.id/ — portal dokumen hukum; konfirmasi ke situs anggota saat ada keraguan.
- Database Peraturan Ditjen PP: https://peraturan.go.id/ — pencarian peraturan, status dan relasi.
- Pasal.id repo: https://github.com/ilhamfp/pasal — konsep data hukum terstruktur; lisensi AGPL-3.0.
- ILDIS repo: https://github.com/bphndigitalservice/ildis — pengelolaan dokumen hukum dan dukungan anggota JDIHN.
- Referensi layanan hukum: https://github.com/ridwanlawson/Sistem-Informasi-Pelayanan-Jasa-Hukum-Legal-Service-System-Information — wajib audit lisensi/struktur sebelum reuse.
- Direktori Putusan MA: https://putusan3.mahkamahagung.go.id/
- Mahkamah Konstitusi: https://www.mkri.id/

Sumber dan tautan harus diuji berkala; daftar ini merupakan titik awal, bukan jaminan semua sumber menyediakan API, bulk download, atau izin crawling.
