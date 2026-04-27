import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/db/client';
import { aplicaciones, escuelas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function AplicacionesPage() {
  const t = await getTranslations('aplicacion');
  let filas: Array<{
    id: string;
    cct: string;
    escuela: string;
    modalidad: string;
    estado: string;
    inicio: Date;
    fin: Date;
  }> = [];

  try {
    const rows = await db
      .select({
        id: aplicaciones.id,
        cct: aplicaciones.claveEscuela,
        escuela: escuelas.nombre,
        modalidad: aplicaciones.modalidad,
        estado: aplicaciones.estado,
        inicio: aplicaciones.ventanaInicio,
        fin: aplicaciones.ventanaFin,
      })
      .from(aplicaciones)
      .leftJoin(escuelas, eq(escuelas.claveCct, aplicaciones.claveEscuela));
    filas = rows.map((r) => ({ ...r, escuela: r.escuela ?? r.cct }));
  } catch {
    // BD no disponible.
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t('titulo')}</h1>
      <p className="mt-1 text-sm text-slate-600">
        Capa 5 · Modelo Through-Year (Pilotaje + Diagnóstico + 3 Seguimientos) · cuatro modalidades
        de aplicación según censo de infraestructura del CCT (RA-04).
      </p>

      <Card className="mt-6">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2">Escuela (CCT)</th>
              <th className="py-2">Modalidad</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Ventana</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-t border-slate-100">
                <td className="py-2">
                  <p className="font-medium text-slate-900">{f.escuela}</p>
                  <p className="text-xs text-slate-500">{f.cct}</p>
                </td>
                <td className="py-2">
                  <Badge variante="info">{t(`modalidad.${f.modalidad}`)}</Badge>
                </td>
                <td className="py-2">
                  <Badge variante={f.estado === 'FINALIZADA' ? 'exito' : 'alerta'}>
                    {t(`estado.${f.estado}`)}
                  </Badge>
                </td>
                <td className="py-2 text-xs text-slate-600">
                  {new Date(f.inicio).toLocaleDateString('es-MX')} —{' '}
                  {new Date(f.fin).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                  No hay aplicaciones programadas. Use el módulo de Operaciones para programar una.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
