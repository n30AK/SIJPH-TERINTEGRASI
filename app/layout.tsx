import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIJPH Terintegrasi — Pelayanan Jasa Hukum",
  description: "Layanan hukum, konsultasi awal, informasi, dan pengajuan layanan dalam satu platform terintegrasi.",
  applicationName: "SIJPH-TERINTEGRASI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
