import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SED 2.0 — Sistema de Evaluación Dinámica',
    template: '%s · SED 2.0',
  },
  description:
    'Plataforma estatal de evaluación adaptativa del Centro de Evaluación Educativa del Estado de Yucatán.',
  applicationName: 'SED 2.0',
  authors: [{ name: 'CEEEY · Centro de Evaluación Educativa del Estado de Yucatán' }],
  generator: 'Next.js 14',
  keywords: ['evaluación', 'educación', 'CEEEY', 'Yucatán', 'TRI', 'CAT', 'maya'],
  robots: { index: false, follow: false }, // entorno previo a producción
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#970E48',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
