import { redirect } from "next/navigation";
import { PageShell } from "@/components/Brand";
import { requireAdmin } from "@/lib/admin-auth";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default function PanelPage() {
  const admin = requireAdmin();
  if (!admin) redirect("/login?admin=1");

  return (
    <PageShell subtitle="Panel de administración">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-berry">Panel del piloto</h1>
          <p className="text-sm text-ink">
            Sesión: {admin.username} · ROLE_PILOT_ADMIN
          </p>
        </div>
      </div>
      <div className="gold-rule mb-6 w-full" />
      <Dashboard />
    </PageShell>
  );
}
