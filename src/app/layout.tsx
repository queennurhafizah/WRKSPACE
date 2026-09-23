import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit, Caveat } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WRKSPACE — Tempat Kerja Energik, Hasil Maksimal",
    template: "%s · WRKSPACE",
  },
  description:
    "Reservasi coworking space dengan mudah — personal desk, meeting room, dan private office. Booking online dalam hitungan detik.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${bricolage.variable} ${outfit.variable} ${caveat.variable}`}
    >
      <body className="min-h-dvh bg-ivory text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
