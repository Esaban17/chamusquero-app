import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chamusqueros · Penales del fútbol chapín",
  description:
    "Elige a tu equipo del fútbol guatemalteco y llévalo de Tercera División a campeón de Liga Nacional ganando tandas de penales en línea.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Header />
        <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
