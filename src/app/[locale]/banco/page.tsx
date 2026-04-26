import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { db } from '@/db/client';
import { retos } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function BancoPage() {
  const t = useTranslations('banco');

  let total = 0;
  let porEstado: Array<{ estado: string; n: number }> = [];
  try {
    const filas = await db
      .select({ estado: retos.estado, n: sql<number>`count(*)::int` })
      .from(retos)
      .groupBy(retos.estado);
    porEstado = filas.map((f) => ({ estado: f.estado, n: Number(f.n) }));
    total = porEstado.reduce((acc, f) => acc + f.n, 0);
  } catch {
    // Sin BD disponible — la página debe seguir siendo renderizable.
  }

  const operativos = porEstado.find((f) => f.estado === 'OPERATIVO')?.n ?? 0;
  const enRevision = porEstado
    .filter((f) =>
      ['CREADO', 'REVISADO_1', 'REVISADO_2', 'EN_ARBITRAJE', 'REVISADO_FILOLOGICO'].includes(f.estado),
    )
    .reduce((acc, f) => acc + f.n, 0);
  const calibrados = porEstado.find((f) => f.estado === 'CALIBRADO')?.n ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('titulo')}</h1>
          <p className="text-sm text-slate-600">
            Capa 3 · Contenidos · QTI 3.0 · doble revisión ciega · bilingüe es/yua
          </p>
        </div>
        <a
          href="banco/nuevo"
          className="rounded bg-ceeey-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-ceeey-800 focus:outline-none focus:ring-2 focus:ring-ceeey-500"
        >
          {t('nuevoReto')}
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Metrica etiqueta={t('totalRetos')} valor={total} />
        <Metrica etiqueta={t('operativos')} valor={operativos} variante="exito" />
        <Metrica etiqueta={t('enRevision')} valor={enRevision} variante="alerta" />
        <Metrica etiqueta={t('calibrados')} valor={calibrados} variante="info" />
      </section>

      <section className="mt-8">
        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Distribución por estado</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Estado</th>
                <th className="py-2 text-right">Cantidad</th>
                <th className="py-2 pl-4">Regla aplicable</th>
              </tr>
            </thead>
            <tbody>
              {porEstado.map((f) => (
                <tr key={f.estado} className="border-t border-slate-100">
                  <td className="py-2">
                    <Badge variante={mapVariante(f.estado)}>{t(`estados.${f.estado}`)}</Badge>
                  </td>
                  <td className="py-2 text-right font-mono">{f.n}</td>
                  <td className="py-2 pl-4 text-xs text-slate-500">{reglaPorEstado(f.estado)}</td>
                </tr>
              ))}
              {porEstado.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-slate-500">
                    Aún no se han creado retos. Usa “Nuevo reto” para iniciar el banco.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

function Metrica({
  etiqueta,
  valor,
  variante = 'neutro',
}: {
  etiqueta: string;
  valor: number;
  variante?: 'neutro' | 'exito' | 'alerta' | 'info';
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{valor}</p>
      <Badge variante={variante} className="mt-2">
        capa 3
      </Badge>
    </Card>
  );
}

function mapVariante(estado: string): 'neutro' | 'exito' | 'alerta' | 'info' | 'critico' {
  if (estado === 'OPERATIVO') return 'exito';
  if (estado === 'RETIRADO') return 'critico';
  if (estado === 'CALIBRADO') return 'info';
  if (estado === 'EN_ARBITRAJE') return 'alerta';
  return 'neutro';
}

function reglaPorEstado(estado: string): string {
  switch (estado) {
    case 'CREADO':
      return 'RB-01: requiere doble revisión ciega.';
    case 'REVISADO_1':
    case 'REVISADO_2':
      return 'RB-02: doble revisión ciega.';
    case 'EN_ARBITRAJE':
      return 'RB-02: árbitro resuelve discrepancia.';
    case 'REVISADO_FILOLOGICO':
      return 'RB-03: revisión filológica completa.';
    case 'EN_PILOTAJE':
      return 'RB-05: requiere ≥ 500 respuestas.';
    case 'CALIBRADO':
      return 'Listo para pasar a OPERATIVO.';
    case 'OPERATIVO':
      return 'RB-08: exposición ≤ 30%.';
    case 'RETIRADO':
      return 'RB-07: respuestas previas conservadas.';
    default:
      return '';
  }
}
