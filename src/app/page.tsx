import Link from "next/link";
import { PageShell, SectionSeparator } from "@/components/Brand";

const FEATURES: { title: string; desc: string }[] = [
  {
    title: "Flujo cognitivo de 3 pasos",
    desc: "Cada reactivo se resuelve en producción abierta (1A), reconocimiento discriminativo (1B) y autorreporte procedimental (1C).",
  },
  {
    title: "Testing Multi-Etapa híbrido",
    desc: "Máquina de estados finita determinista con invariantes y commit transaccional ACID por reactivo.",
  },
  {
    title: "Triple coordenada cognitiva",
    desc: "Habilidades de Facione, niveles de Anderson-Krathwohl y componentes metacognitivos de Pintrich.",
  },
  {
    title: "Roles y permisos (RBAC/ABAC)",
    desc: "Estudiante por token de un solo uso y administración del piloto con usuario y contraseña.",
  },
  {
    title: "Auditoría íntegra",
    desc: "Registro append-only encadenado con hash SHA-256 e idempotencia por evento de sincronización.",
  },
  {
    title: "Reportería y dataset",
    desc: "Patrones inferenciales P1–P8, perfil cognitivo y exportación anonimizada en CSV UTF-8.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      {/* Portada estilo manual */}
      <section className="relative mb-10 overflow-hidden rounded-xl bg-berry px-8 py-16 text-white">
        <div className="absolute inset-y-0 left-0 w-2 bg-gold" />
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-light">
          Renacimiento Maya · Yucatán 2024–2030
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Sistema de Evaluación Adaptativa Multi-Etapa
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-offwhite">
          Plataforma de la Prueba de Concepto (Etapa 1) para evaluar el
          pensamiento crítico mediante un flujo cognitivo de tres pasos.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/login" className="btn-gold">
            Ingresar
          </Link>
          <Link
            href="/login?admin=1"
            className="btn-outline border-white text-white hover:bg-white hover:text-berry"
          >
            Acceso administración
          </Link>
        </div>
      </section>

      <SectionSeparator>Capacidades de la plataforma</SectionSeparator>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="gold-rule mb-3 w-12" />
            <h3 className="mb-2 text-lg font-bold text-berry">{f.title}</h3>
            <p className="text-sm text-ink">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Cierre institucional estilo manual (pagina 64) */}
      <div className="mt-12 overflow-hidden rounded-xl border border-crema">
        <div className="gold-line" />
        <div className="bg-crema px-8 py-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-berry">
            Renacimiento Maya
          </p>
          <p className="mt-1 text-lg font-bold text-ink">Yucatán 2024–2030</p>
        </div>
      </div>
    </PageShell>
  );
}
