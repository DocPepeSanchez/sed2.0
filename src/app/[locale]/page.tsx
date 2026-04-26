import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();

  const modulos = [
    {
      href: `/${locale}/banco`,
      titulo: t('nav.banco'),
      descripcion:
        'Banco calibrado de retos bilingüe español-maya con doble revisión ciega y revisión filológica.',
      capa: 'Capa 3 · Contenidos',
    },
    {
      href: `/${locale}/instrumentos`,
      titulo: t('nav.instrumentos'),
      descripcion:
        'Pilotaje, Diagnóstico y Seguimiento bajo modelo Through-Year inspirado en STAAR-TTAP.',
      capa: 'Capa 5 · Aplicación',
    },
    {
      href: `/${locale}/aplicaciones`,
      titulo: t('nav.aplicaciones'),
      descripcion: 'Cuatro modalidades por censo: 1:1, rotación, grupal y captura OMR offline-first.',
      capa: 'Capa 5 · Aplicación',
    },
    {
      href: `/${locale}/calificacion`,
      titulo: t('nav.calificacion'),
      descripcion: 'Triple capa: cerrados automáticos, IA en abiertos cortos y humanos en casos límite.',
      capa: 'Capa 6 · Calificación',
    },
    {
      href: `/${locale}/reportes`,
      titulo: t('nav.reportes'),
      descripcion: 'Cinco niveles: Estudiante, Escuela, Zona, Región, Estado. Familias bilingüe.',
      capa: 'Capa 7 · Ecosistema',
    },
    {
      href: `/${locale}/observatorio`,
      titulo: t('nav.observatorio'),
      descripcion: 'Datos abiertos federados al portal de transparencia con licencia abierta.',
      capa: 'Capa 8 · Institucional',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-ceeey-600">
          Plan Renacimiento Maya 2024–2030
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {t('app.subtitulo')}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Plataforma estatal de evaluación adaptativa, diagnóstica y de seguimiento del CEEEY,
          alineada con el Plan de Estudio para la Educación Básica 2022 y el Marco Curricular Común
          de Educación Media Superior 2023.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-ceeey-300 hover:shadow-md focus:border-ceeey-500 focus:outline-none focus:ring-2 focus:ring-ceeey-500"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-maya-600">{m.capa}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-ceeey-700">
              {m.titulo}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{m.descripcion}</p>
          </Link>
        ))}
      </section>

      <section className="mt-12 grid gap-6 rounded-lg bg-ceeey-50 p-6 lg:grid-cols-3">
        <Indicador valor="≥ 99.5%" etiqueta="Disponibilidad de plataforma" detalle="P-10" />
        <Indicador valor="≤ 72 h" etiqueta="Devolución oportuna" detalle="95 % de respuestas" />
        <Indicador valor="WCAG 2.1 AA" etiqueta="Accesibilidad" detalle="P-08 por diseño" />
      </section>
    </div>
  );
}

function Indicador({ valor, etiqueta, detalle }: { valor: string; etiqueta: string; detalle: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-ceeey-700">{valor}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{etiqueta}</p>
      <p className="text-xs text-slate-600">{detalle}</p>
    </div>
  );
}
