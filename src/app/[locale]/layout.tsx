import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Lato } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const LOCALES = ['es', 'yua'] as const;

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr" className={lato.variable}>
      <body className="min-h-screen flex flex-col bg-crema-100 font-sans text-slate-900">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <a href="#contenido-principal" className="skip-link">
            Saltar al contenido principal
          </a>
          <Header locale={locale} />
          <main id="contenido-principal" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
