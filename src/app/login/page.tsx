import { Suspense } from "react";
import { PageShell } from "@/components/Brand";
import LoginTabs from "./LoginTabs";

export default function LoginPage() {
  return (
    <PageShell subtitle="Acceso">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-berry">Ingresar</h1>
        <div className="gold-rule mb-6 w-16" />
        <Suspense fallback={null}>
          <LoginTabs />
        </Suspense>
      </div>
    </PageShell>
  );
}
