import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const LOCALES = ['es', 'yua'] as const;

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
    <html lang={locale} dir="ltr">
      <body className="min-h-screen flex flex-col">
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
