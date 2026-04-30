import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';
import { SessionWidget } from './SessionWidget';

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const tApp = useTranslations('app');

  return (
    <header>
      {/* Barra superior berry — color primario institucional. */}
      <div className="bg-berry-500 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link
            href={`/${locale}`}
            className="flex flex-col leading-tight focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span className="text-lg font-black tracking-tight">{tApp('nombre')}</span>
            <span className="text-xs font-light opacity-90">{tApp('subtitulo')}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2 text-sm" aria-label="Menú principal">
            <NavLink href={`/${locale}/banco`}>{t('banco')}</NavLink>
            <NavLink href={`/${locale}/aplicaciones`}>{t('aplicaciones')}</NavLink>
            <NavLink href={`/${locale}/calificacion`}>{t('calificacion')}</NavLink>
            <NavLink href={`/${locale}/reportes`}>{t('reportes')}</NavLink>
            <NavLink href={`/${locale}/alertas`}>{t('alertas')}</NavLink>
            <NavLink href={`/${locale}/observatorio`}>{t('observatorio')}</NavLink>
            <LocaleSwitcher current={locale} />
            <SessionWidget locale={locale} />
          </nav>
        </div>
      </div>
      {/* Línea decorativa dorada — separador institucional según manual. */}
      <div className="linea-dorada" aria-hidden="true" />
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-2 hover:bg-berry-600 focus:bg-berry-600 focus:outline-none focus:ring-2 focus:ring-white"
    >
      {children}
    </Link>
  );
}
