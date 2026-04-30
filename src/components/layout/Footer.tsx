import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tApp = useTranslations('app');
  return (
    <footer className="mt-12 bg-crema-200 text-sm text-slate-800">
      {/* Línea decorativa dorada — separador institucional. */}
      <div className="linea-dorada" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-berry-600">
            Renacimiento Maya · Yucatán 2024–2030
          </p>
          <p className="mt-2 text-base font-bold text-berry-700">{tApp('ceeey')}</p>
          <p className="text-xs text-slate-600">Mérida, Yucatán · México</p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2 self-start text-slate-700">
          <li>
            <a href="/aviso-privacidad" className="underline hover:text-berry-600 hover:no-underline">
              {t('aviso')}
            </a>
          </li>
          <li>
            <a href="/transparencia" className="underline hover:text-berry-600 hover:no-underline">
              {t('transparencia')}
            </a>
          </li>
          <li>
            <a href="/datos-abiertos" className="underline hover:text-berry-600 hover:no-underline">
              {t('datosAbiertos')}
            </a>
          </li>
          <li>
            <a href="/contacto" className="underline hover:text-berry-600 hover:no-underline">
              {t('contacto')}
            </a>
          </li>
        </ul>

        <p className="text-xs text-slate-600 md:text-right">
          v2.0 · WCAG 2.1 AA · ISO 27001 · ISO 9001
        </p>
      </div>

      {/* Pie institucional final — referencia oficial Renacimiento Maya. */}
      <div className="bg-berry-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between text-xs">
          <span className="font-bold tracking-wide">Plan Renacimiento Maya · Yucatán 2024–2030</span>
          <span className="opacity-80">© CEEEY · {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
