import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pemberitahuan Privasi — SIJPH-TERINTEGRASI",
  description: "Pemberitahuan tentang pemrosesan data pada layanan SIJPH-TERINTEGRASI.",
};

export default function PrivacyPage() {
  const controller = process.env.DATA_CONTROLLER_NAME?.trim();
  const contact = process.env.PRIVACY_CONTACT_EMAIL?.trim();
  const version = process.env.PRIVACY_NOTICE_VERSION?.trim();
  const configured = Boolean(controller && contact && version);
  return (
    <main style={{ minHeight: "100vh", background: "#fbfaf7", color: "#172c2b", padding: "56px 24px", fontFamily: "Arial, sans-serif" }}>
      <article style={{ maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
        <Link href="/" style={{ color: "#1e6257", fontWeight: 700 }}>← Kembali ke beranda</Link>
        <p style={{ color: "#1e6257", letterSpacing: ".12em", fontSize: 12, fontWeight: 700, marginTop: 36 }}>SIJPH-TERINTEGRASI</p>
        <h1 style={{ fontSize: 38, letterSpacing: "-.04em" }}>Pemberitahuan Privasi</h1>
        {!configured && <p role="status" style={{ padding: 14, background: "#fff1d6", borderRadius: 8 }}>Konfigurasi pengendali data belum lengkap. Formulir permohonan online harus tetap dinonaktifkan sampai identitas pengendali, kontak privasi, dan versi pemberitahuan disahkan serta dikonfigurasi.</p>}
        <p>Terakhir diperbarui: {version ?? "Belum ditetapkan"}.</p>
        <h2>1. Pengendali data dan kontak</h2>
        <p>Pengendali data: <strong>{controller ?? "Belum dikonfigurasi"}</strong>.</p>
        <p>Kontak privasi untuk permintaan akses, koreksi, atau pertanyaan pemrosesan data: <strong>{contact ?? "Belum dikonfigurasi"}</strong>.</p>
        <h2>2. Data yang dapat dikumpulkan</h2>
        <p>Jika formulir permohonan diaktifkan, sistem meminta nama, alamat email, nomor telepon, jenis layanan, ringkasan kebutuhan, dan catatan persetujuan. Kirim hanya data yang diperlukan. Jangan mengirim kata sandi, nomor identitas lengkap, rekam medis, data anak, dokumen rahasia, atau informasi sensitif melalui formulir publik.</p>
        <h2>3. Tujuan pemrosesan</h2>
        <p>Data digunakan untuk menerima, mencatat, menilai kelengkapan, menghubungi pemohon, dan menindaklanjuti permohonan layanan. Penggunaan lebih lanjut harus memiliki dasar pemrosesan yang sah dan dijelaskan sebelum data dikumpulkan.</p>
        <h2>4. Akses, keamanan, dan pengungkapan</h2>
        <p>Akses harus dibatasi kepada petugas berwenang berdasarkan tugasnya. Data permohonan tidak boleh ditampilkan pada digital signage atau dikirim ke model AI publik. Pengungkapan kepada pihak lain hanya dilakukan berdasarkan dasar yang sah dan kebutuhan layanan yang dijelaskan kepada pemohon.</p>
        <h2>5. Retensi dan hak subjek data</h2>
        <p>Pengelola wajib menetapkan jadwal retensi, prosedur koreksi dan penghapusan, pengelolaan insiden, serta proses permintaan hak subjek data sebelum menerima data produksi. Jangan menjanjikan penghapusan atau kerahasiaan absolut tanpa prosedur dan kontrol yang teruji.</p>
        <h2>6. AI Companion — suara dan percakapan</h2>
        <p>AI Companion dapat memproses pertanyaan yang diketik dan, jika pengguna mengizinkan mikrofon, hasil pengenalan suara yang disediakan browser. Jawaban suara dibacakan menggunakan fitur text-to-speech perangkat; kualitas Bahasa Indonesia, pilihan suara, dan ketersediaan Bahasa Jawa bergantung pada browser dan sistem operasi. Audio tidak dikirim sebagai rekaman ke server oleh fitur ini; hasil transkripsi dikirim sebagai teks ke endpoint AI saat model dikonfigurasi.</p>
        <p>Pertanyaan percakapan dikirim ke penyedia model AI yang dikonfigurasi pengelola. Sebelum AI diaktifkan untuk publik, pengelola wajib meninjau kontrak pemrosesan data, lokasi pemrosesan, retensi penyedia, dasar pemrosesan, dan pemberitahuan kepada pengguna. Hindari mengirim data perkara, identitas lengkap, bukti rahasia, data anak, atau informasi sensitif. Jawaban AI adalah informasi awal, belum merupakan pendapat hukum final dan tidak didukung RAG hukum terverifikasi kecuali sistem tersebut secara eksplisit diaktifkan serta diuji.</p>
        <h2>7. Perubahan pemberitahuan</h2>
        <p>Perubahan penting pada tujuan, kategori data, penyedia, atau retensi harus ditinjau dan diberitahukan sebelum diberlakukan jika diwajibkan. Pengelola harus memastikan teks ini ditinjau penasihat hukum dan disesuaikan dengan operasi nyata organisasi.</p>
        <p style={{ marginTop: 40, paddingTop: 18, borderTop: "1px solid #e4e7e1", fontSize: 12, color: "#667876" }}>
          {configured ? "Pemberitahuan terkonfigurasi; tetap memerlukan persetujuan hukum dan operasional pengelola." : "Status: konfigurasi belum lengkap — penerimaan data produksi tidak boleh diaktifkan."}
        </p>
      </article>
    </main>
  );
}
