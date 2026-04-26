import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/db/client';
import { instrumentos } from '@/db/schema';

export const dynamic = 'force-dynamic';

export default async function InstrumentosPage() {
  let filas: Array<{
    id: string;
    clave: string;
    tipo: string;
    fase: number;
    grado: number;
    longitud: number;
    estado: string;
  }> = [];
  try {
    const rows = await db.select().from(instrumentos);
    filas = rows.map((r) => ({
      id: r.id,
      clave: r.clave,
      tipo: r.tipo,
      fase: r.fase,
      grado: r.grado,
      longitud: r.longitudObjetivo,
      estado: r.estado,
    }));
  } catch {
    // sin BD
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Instrumentos</h1>
      <p className="mt-1 text-sm text-slate-600">
        Modelo Through-Year inspirado en STAAR-TTAP. Tipos: Pilotaje, Diagnóstico,
        Seguimiento 1/2/3.
      </p>

      <Card className="mt-6">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2">Clave</th>
              <th className="py-2">Tipo</th>
              <th className="py-2">Fase / Grado</th>
              <th className="py-2 text-right">Longitud objetivo</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-t border-slate-100">
                <td className="py-2 font-mono text-xs">{f.clave}</td>
                <td className="py-2">
                  <Badge variante="info">{f.tipo}</Badge>
                </td>
                <td className="py-2">
                  Fase {f.fase} · {f.grado}.º
                </td>
                <td className="py-2 text-right">{f.longitud} reactivos</td>
                <td className="py-2">
                  <Badge variante={f.estado === 'PUBLICADO' ? 'exito' : 'neutro'}>
                    {f.estado}
                  </Badge>
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                  No hay instrumentos publicados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
