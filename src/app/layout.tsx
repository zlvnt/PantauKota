import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaporLingkungan - PantauKota",
  description: "Aplikasi Lapor Lingkungan / PantauKota",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", inter.variable, manrope.variable)}>
      <body className={`${inter.variable} ${manrope.variable} antialiased text-on-surface bg-surface`}>
        {children}
      </body>
    </html>
  );
}
