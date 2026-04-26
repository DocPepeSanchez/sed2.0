import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';

export default function ReportesPage() {
  const t = useTranslations('reportes');
  const niveles = [
    { id: 'estudiante', clave: 'ESTUDIANTE', regla: 'RR-02 bilingüe · RR-03 lenguaje claro' },
    { id: 'escuela', clave: 'ESCUELA', regla: 'RR-07 anonimización (umbral mínimo 5)' },
    { id: 'zona', clave: 'ZONA', regla: 'RR-05 alerta si caída > 0.5 SD' },
    { id: 'region', clave: 'REGION', regla: 'RR-06 datos abiertos' },
    { id: 'estado', clave: 'ESTADO', regla: 'Informe Técnico Anual' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
      <p className="mt-1 text-sm text-slate-600">
        Cinco niveles jerárquicos con devolución oportuna en ≤ 72 h al 95 % de respuestas (RC-07).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {niveles.map((n) => (
          <Card key={n.id}>
            <h2 className="text-base font-semibold">{t(n.id as 'estudiante')}</h2>
            <Badge variante="info" className="mt-1">
              Nivel {n.clave}
            </Badge>
            <p className="mt-2 text-xs text-slate-500">{n.regla}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <h2 className="text-base font-semibold">Bandas de desempeño</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li>
            <Badge variante="critico">{t('bandas.INSUFICIENTE')}</Badge>{' '}
            <span className="text-xs text-slate-600">θ &lt; −1.0</span>
          </li>
          <li>
            <Badge variante="alerta">{t('bandas.BASICO')}</Badge>{' '}
            <span className="text-xs text-slate-600">−1.0 ≤ θ &lt; 0</span>
          </li>
          <li>
            <Badge variante="info">{t('bandas.SATISFACTORIO')}</Badge>{' '}
            <span className="text-xs text-slate-600">0 ≤ θ &lt; 1.0</span>
          </li>
          <li>
            <Badge variante="exito">{t('bandas.SOBRESALIENTE')}</Badge>{' '}
            <span className="text-xs text-slate-600">θ ≥ 1.0</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Cortes provisionales — la Unidad Psicométrica fija los definitivos tras pilotaje y
          standard setting (RG-06).
        </p>
      </Card>
    </div>
  );
}
