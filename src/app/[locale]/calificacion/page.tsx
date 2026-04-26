import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';

export default function CalificacionPage() {
  const t = useTranslations('nav');
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t('calificacion')}</h1>
      <p className="mt-1 text-sm text-slate-600">
        Capa 6 · Triple capa: cerrados automáticos (RC-01), IA en abiertos cortos (RC-02), humanos en
        casos límite (RC-04). Concordancia kappa ≥ 0.70 (RC-05). 95 % en ≤ 72 h (RC-07).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold">Cerrados</h2>
          <Badge variante="exito" className="mt-1">
            Automático
          </Badge>
          <p className="mt-2 text-sm text-slate-600">
            Comparación contra clave del banco. Tiempo objetivo &lt; 1 segundo.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Abiertos cortos</h2>
          <Badge variante="info" className="mt-1">
            IA fine-tuned
          </Badge>
          <p className="mt-2 text-sm text-slate-600">
            Modelo Llama 3 / Mistral ajustado a rúbrica oficial (ADR-07). 5–10 % de muestreo a humano
            (RC-03).
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Casos límite y abiertos largos</h2>
          <Badge variante="alerta" className="mt-1">
            Humano certificado
          </Badge>
          <p className="mt-2 text-sm text-slate-600">
            Doble calificación ciega; arbitraje si discrepan (RC-06).
          </p>
        </Card>
      </div>
    </div>
  );
}
