import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/db/client';
import { alertas } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AlertasPage() {
  let filas: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    severidad: string;
    tipo: string;
    estado: string;
    createdAt: Date;
  }> = [];

  try {
    const rows = await db
      .select()
      .from(alertas)
      .orderBy(desc(alertas.createdAt))
      .limit(50);
    filas = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      severidad: r.severidad,
      tipo: r.tipo,
      estado: r.estado,
      createdAt: r.createdAt,
    }));
  } catch {
    // BD no disponible.
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Alertas tempranas</h1>
      <p className="mt-1 text-sm text-slate-600">
        RR-04 / RR-05 — disparos automáticos por caída &gt; 1 SD (estudiante) y &gt; 0.5 SD (grupo
        completo).
      </p>

      <div className="mt-6 grid gap-3">
        {filas.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{a.titulo}</p>
                <p className="mt-1 text-sm text-slate-600">{a.descripcion}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {a.tipo} · {new Date(a.createdAt).toLocaleString('es-MX')}
                </p>
              </div>
              <Badge variante={mapSev(a.severidad)}>{a.severidad}</Badge>
            </div>
          </Card>
        ))}
        {filas.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">Sin alertas activas en este momento.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function mapSev(s: string): 'neutro' | 'alerta' | 'critico' {
  if (s === 'CRITICA') return 'critico';
  if (s === 'ALTA' || s === 'MEDIA') return 'alerta';
  return 'neutro';
}
