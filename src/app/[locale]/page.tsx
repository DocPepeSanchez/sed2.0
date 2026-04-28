import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/security/session';
import { perfilDeRoles } from '@/lib/security/role-family';
import { RoleDashboard, type TextosDashboard } from '@/components/dashboard/RoleDashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const sess = await getSession();
  const t = await getTranslations();

  if (sess.sujeto) {
    const roles = (sess.asignaciones ?? []).map((a) => a.rol);
    const perfil = perfilDeRoles(roles);
    const textos = construirTextos(t);
    return (
      <RoleDashboard
        perfil={perfil}
        locale={locale}
        rfc={sess.sujeto}
        rolesAsignados={roles}
        textos={textos}
      />
    );
  }

  const modulos = [
    {
      href: `/${locale}/banco`,
      titulo: t('nav.banco'),
      descripcion: t('home.modulos.banco'),
      capa: 'Capa 3 · Contenidos',
    },
    {
      href: `/${locale}/instrumentos`,
      titulo: t('nav.instrumentos'),
      descripcion: t('home.modulos.instrumentos'),
      capa: 'Capa 5 · Aplicación',
    },
    {
      href: `/${locale}/aplicaciones`,
      titulo: t('nav.aplicaciones'),
      descripcion: t('home.modulos.aplicaciones'),
      capa: 'Capa 5 · Aplicación',
    },
    {
      href: `/${locale}/calificacion`,
      titulo: t('nav.calificacion'),
      descripcion: t('home.modulos.calificacion'),
      capa: 'Capa 6 · Calificación',
    },
    {
      href: `/${locale}/reportes`,
      titulo: t('nav.reportes'),
      descripcion: t('home.modulos.reportes'),
      capa: 'Capa 7 · Ecosistema',
    },
    {
      href: `/${locale}/observatorio`,
      titulo: t('nav.observatorio'),
      descripcion: t('home.modulos.observatorio'),
      capa: 'Capa 8 · Institucional',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-ceeey-600">
          {t('home.lema')}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">{t('app.subtitulo')}</h1>
        <p className="mt-3 max-w-3xl text-slate-700">{t('home.intro')}</p>
        <Link
          href={`/${locale}/login`}
          className="mt-5 inline-block rounded bg-ceeey-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-ceeey-800 focus:outline-none focus:ring-2 focus:ring-ceeey-500"
        >
          {t('auth.iniciarSesion')}
        </Link>
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
        <Indicador valor="≥ 99.5%" etiqueta={t('home.indicadores.disponibilidad')} detalle="P-10" />
        <Indicador valor="≤ 72 h" etiqueta={t('home.indicadores.devolucion')} detalle="95 % de respuestas" />
        <Indicador valor="WCAG 2.1 AA" etiqueta={t('home.indicadores.accesibilidad')} detalle="P-08" />
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

function construirTextos(t: Awaited<ReturnType<typeof getTranslations>>): TextosDashboard {
  return {
    hola: t('dashboard.hola'),
    rolesActivos: t('dashboard.rolesActivos'),
    directivoTitulo: t('dashboard.directivo.titulo'),
    directivoSubtitulo: t('dashboard.directivo.subtitulo'),
    academicoTitulo: t('dashboard.academico.titulo'),
    academicoSubtitulo: t('dashboard.academico.subtitulo'),
    docenteTitulo: t('dashboard.docente.titulo'),
    docenteSubtitulo: t('dashboard.docente.subtitulo'),
    estudianteTitulo: t('dashboard.estudiante.titulo'),
    estudianteSubtitulo: t('dashboard.estudiante.subtitulo'),
    otroTitulo: t('dashboard.otro.titulo'),
    otroSubtitulo: t('dashboard.otro.subtitulo'),
    kpiCobertura: t('dashboard.kpi.cobertura'),
    kpiBanco: t('dashboard.kpi.banco'),
    kpiDevolucion: t('dashboard.kpi.devolucion'),
    banco: t('nav.banco'),
    bancoDesc: t('home.modulos.banco'),
    aplicaciones: t('nav.aplicaciones'),
    aplicacionesDesc: t('home.modulos.aplicaciones'),
    reportes: t('nav.reportes'),
    reportesDesc: t('home.modulos.reportes'),
    observatorio: t('nav.observatorio'),
    observatorioDesc: t('home.modulos.observatorio'),
    alertas: t('nav.alertas'),
    alertasDesc: t('home.modulos.alertas'),
    calificacion: t('nav.calificacion'),
    calificacionDesc: t('home.modulos.calificacion'),
    instrumentos: t('nav.instrumentos'),
    instrumentosDesc: t('home.modulos.instrumentos'),
    miReporte: t('dashboard.estudiante.miReporte'),
    miReporteDesc: t('dashboard.estudiante.miReporteDesc'),
    proximaAplicacion: t('dashboard.estudiante.proximaAplicacion'),
    proximaAplicacionDesc: t('dashboard.estudiante.proximaAplicacionDesc'),
  };
}
