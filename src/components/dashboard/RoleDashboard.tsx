import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Perfil } from '@/lib/security/role-family';

interface ModuloLink {
  href: string;
  titulo: string;
  descripcion: string;
  capa: string;
}

interface Props {
  perfil: Perfil;
  locale: string;
  rfc: string;
  rolesAsignados: string[];
  textos: TextosDashboard;
}

export interface TextosDashboard {
  hola: string;
  rolesActivos: string;
  // títulos por perfil
  directivoTitulo: string;
  directivoSubtitulo: string;
  academicoTitulo: string;
  academicoSubtitulo: string;
  docenteTitulo: string;
  docenteSubtitulo: string;
  estudianteTitulo: string;
  estudianteSubtitulo: string;
  otroTitulo: string;
  otroSubtitulo: string;
  // KPIs
  kpiCobertura: string;
  kpiBanco: string;
  kpiDevolucion: string;
  // Módulos comunes
  banco: string;
  bancoDesc: string;
  aplicaciones: string;
  aplicacionesDesc: string;
  reportes: string;
  reportesDesc: string;
  observatorio: string;
  observatorioDesc: string;
  alertas: string;
  alertasDesc: string;
  calificacion: string;
  calificacionDesc: string;
  instrumentos: string;
  instrumentosDesc: string;
  // Estudiante
  miReporte: string;
  miReporteDesc: string;
  proximaAplicacion: string;
  proximaAplicacionDesc: string;
}

export function RoleDashboard({ perfil, locale, rfc, rolesAsignados, textos }: Props) {
  const titulo = obtenerTitulo(perfil, textos);
  const subtitulo = obtenerSubtitulo(perfil, textos);
  const modulos = obtenerModulos(perfil, locale, textos);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-berry-600">
          {textos.hola} · <span className="font-mono">{rfc}</span>
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">{titulo}</h1>
        <p className="mt-2 max-w-3xl text-slate-700">{subtitulo}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">
            {textos.rolesActivos}:
          </span>
          {rolesAsignados.map((r) => (
            <Badge key={r} variante={varianteParaPerfil(perfil)}>
              {r}
            </Badge>
          ))}
        </div>
      </header>

      {perfil === 'directivo' && (
        <section className="mb-10 grid gap-4 lg:grid-cols-3">
          <KpiCard etiqueta={textos.kpiCobertura} valor="≥ 99.5%" detalle="P-10 disponibilidad" />
          <KpiCard etiqueta={textos.kpiBanco} valor="9 retos" detalle="6 OPERATIVO · 3 en flujo" />
          <KpiCard etiqueta={textos.kpiDevolucion} valor="≤ 72 h" detalle="95 % de respuestas" />
        </section>
      )}

      {perfil === 'estudiante' && (
        <section className="mb-10 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-base font-semibold text-slate-900">{textos.proximaAplicacion}</h2>
            <p className="mt-2 text-sm text-slate-600">{textos.proximaAplicacionDesc}</p>
            <Badge variante="info" className="mt-3">
              Capa 5
            </Badge>
          </Card>
          <Card>
            <h2 className="text-base font-semibold text-slate-900">{textos.miReporte}</h2>
            <p className="mt-2 text-sm text-slate-600">{textos.miReporteDesc}</p>
            <Link
              href={`/${locale}/reportes`}
              className="mt-3 inline-block text-sm font-medium text-berry-700 hover:underline"
            >
              {textos.reportes} →
            </Link>
          </Card>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-berry-300 hover:shadow-md focus:border-berry-500 focus:outline-none focus:ring-2 focus:ring-berry-500"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-dorado-600">{m.capa}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-berry-700">
              {m.titulo}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{m.descripcion}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function KpiCard({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-3xl font-bold text-berry-700">{valor}</p>
      <p className="mt-1 text-xs text-slate-600">{detalle}</p>
    </Card>
  );
}

function varianteParaPerfil(perfil: Perfil): 'info' | 'exito' | 'alerta' | 'maya' | 'neutro' {
  switch (perfil) {
    case 'directivo':
      return 'info';
    case 'academico':
      return 'maya';
    case 'docente':
      return 'exito';
    case 'estudiante':
      return 'alerta';
    default:
      return 'neutro';
  }
}

function obtenerTitulo(perfil: Perfil, t: TextosDashboard): string {
  switch (perfil) {
    case 'directivo':
      return t.directivoTitulo;
    case 'academico':
      return t.academicoTitulo;
    case 'docente':
      return t.docenteTitulo;
    case 'estudiante':
      return t.estudianteTitulo;
    default:
      return t.otroTitulo;
  }
}

function obtenerSubtitulo(perfil: Perfil, t: TextosDashboard): string {
  switch (perfil) {
    case 'directivo':
      return t.directivoSubtitulo;
    case 'academico':
      return t.academicoSubtitulo;
    case 'docente':
      return t.docenteSubtitulo;
    case 'estudiante':
      return t.estudianteSubtitulo;
    default:
      return t.otroSubtitulo;
  }
}

function obtenerModulos(perfil: Perfil, locale: string, t: TextosDashboard): ModuloLink[] {
  const M = {
    banco: { href: `/${locale}/banco`, titulo: t.banco, descripcion: t.bancoDesc, capa: 'Capa 3' },
    aplicaciones: {
      href: `/${locale}/aplicaciones`,
      titulo: t.aplicaciones,
      descripcion: t.aplicacionesDesc,
      capa: 'Capa 5',
    },
    reportes: {
      href: `/${locale}/reportes`,
      titulo: t.reportes,
      descripcion: t.reportesDesc,
      capa: 'Capa 7',
    },
    observatorio: {
      href: `/${locale}/observatorio`,
      titulo: t.observatorio,
      descripcion: t.observatorioDesc,
      capa: 'Capa 8',
    },
    alertas: {
      href: `/${locale}/alertas`,
      titulo: t.alertas,
      descripcion: t.alertasDesc,
      capa: 'Capa 7',
    },
    calificacion: {
      href: `/${locale}/calificacion`,
      titulo: t.calificacion,
      descripcion: t.calificacionDesc,
      capa: 'Capa 6',
    },
    instrumentos: {
      href: `/${locale}/instrumentos`,
      titulo: t.instrumentos,
      descripcion: t.instrumentosDesc,
      capa: 'Capa 5',
    },
  } as const;

  switch (perfil) {
    case 'directivo':
      return [M.observatorio, M.reportes, M.alertas, M.aplicaciones, M.banco, M.instrumentos];
    case 'academico':
      return [M.banco, M.calificacion, M.instrumentos, M.reportes, M.observatorio];
    case 'docente':
      return [M.aplicaciones, M.alertas, M.reportes, M.calificacion];
    case 'estudiante':
      return [M.reportes, M.aplicaciones];
    default:
      return [M.observatorio, M.reportes];
  }
}
