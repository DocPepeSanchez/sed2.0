import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SED — Sistema de Evaluación Adaptativa Multi-Etapa",
  description:
    "Plataforma de evaluación adaptativa multi-etapa. Renacimiento Maya / Yucatán 2024–2030.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
