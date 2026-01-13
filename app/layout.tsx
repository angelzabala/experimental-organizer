import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experimental Organizer - OS Style",
  description: "Herramienta de productividad con interfaz estilo sistema operativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}


