import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tApp = useTranslations('app');
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-sm text-slate-700 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-6 grid gap-4 md:grid-cols-3">
        <div>
          <p className="font-semibold">{tApp('ceeey')}</p>
          <p className="text-xs text-slate-500">Mérida, Yucatán · México</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li>
            <a href="/aviso-privacidad" className="underline hover:no-underline">
              {t('aviso')}
            </a>
          </li>
          <li>
            <a href="/transparencia" className="underline hover:no-underline">
              {t('transparencia')}
            </a>
          </li>
          <li>
            <a href="/datos-abiertos" className="underline hover:no-underline">
              {t('datosAbiertos')}
            </a>
          </li>
          <li>
            <a href="/contacto" className="underline hover:no-underline">
              {t('contacto')}
            </a>
          </li>
        </ul>
        <p className="text-xs text-slate-500 md:text-right">
          v2.0 · WCAG 2.1 AA · ISO 27001 · ISO 9001
        </p>
      </div>
    </footer>
  );
}
