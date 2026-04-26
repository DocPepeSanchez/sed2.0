import { Card } from '@/components/ui/Card';

export default function ObservatorioPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Observatorio de Aprendizajes</h1>
      <p className="mt-1 text-sm text-slate-600">
        Capa 8 · Datos abiertos federados al portal de transparencia con licencia abierta (RR-06).
        Anonimización con umbral mínimo de 5 (RR-07).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold">Tablero estatal</h2>
          <p className="mt-2 text-sm text-slate-600">
            Resultados agregados por región, modalidad y campo formativo.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">API REST</h2>
          <p className="mt-2 text-sm text-slate-600">
            OpenAPI 3.1 · OneRoster 1.2 · Caliper Analytics 1.2 · QTI 3.0.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Microdatos investigador</h2>
          <p className="mt-2 text-sm text-slate-600">
            Acceso bajo convenio. Datos anonimizados con k-anonimato ≥ 5.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Informe Técnico Anual</h2>
          <p className="mt-2 text-sm text-slate-600">
            Publicado por el CEEEY ante el Consejo Técnico y Ejecutivo Estatal.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold">Pasaporte Digital</h2>
          <p className="mt-2 text-sm text-slate-600">
            Verifiable Credentials W3C; trayectoria del estudiante portátil entre instituciones.
          </p>
        </Card>
      </div>
    </div>
  );
}
