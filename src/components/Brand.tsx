import Link from "next/link";

const INSTITUTION = "Renacimiento Maya / Yucatán 2024–2030";

export function TopBar({ subtitle }: { subtitle?: string }) {
  return (
    <header>
      <div className="bg-berry text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white font-bold text-berry">
              SED
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-wide">
                Sistema de Evaluación Adaptativa
              </span>
              <span className="block text-xs text-gold-light">
                {subtitle ?? "Multi-Etapa · POC Etapa 1"}
              </span>
            </span>
          </Link>
          <span className="hidden text-right text-xs text-gold-light sm:block">
            {INSTITUTION}
          </span>
        </div>
      </div>
      <div className="gold-line" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="gold-line" />
      <div className="bg-berry-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-6 py-4 text-center text-xs sm:flex-row sm:text-left">
          <span>{INSTITUTION}</span>
          <span className="text-gold-light">
            SED — Sistema de Evaluación Adaptativa Multi-Etapa
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SectionSeparator({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-berry px-8 py-10 text-white">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gold" />
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
  );
}

export function PageShell({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar subtitle={subtitle} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
