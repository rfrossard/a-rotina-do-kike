import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A Rotina do Kike",
  description: "Um jogo 3D para transformar a rotina do Kike em pequenas aventuras.",
  openGraph: {
    title: "A Rotina do Kike",
    description: "Pequenas missões. Grandes conquistas.",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "A Rotina do Kike" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A Rotina do Kike",
    description: "Pequenas missões. Grandes conquistas.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
