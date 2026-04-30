import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/security/session';
import { NuevoRetoForm } from './NuevoRetoForm';

export const dynamic = 'force-dynamic';

export default async function NuevoRetoPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const sess = await getSession();
  if (!sess.sujeto) redirect(`/${locale}/login`);

  const t = await getTranslations('banco');
  const roles = (sess.asignaciones ?? []).map((a) => a.rol);
  const puedeCrear = roles.some((r) =>
    ['ELABORADOR', 'COORD_BANCOS', 'DIR_GENERAL_CEEEY', 'PSICOMETRISTA_SR'].includes(r),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-berry-600">
          {t('titulo')}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{t('nuevoReto')}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Capa 3 · Crea un reto en estado <code className="rounded bg-slate-100 px-1">CREADO</code> con
          versión inmutable 1.0.0. Requiere doble revisión ciega antes de pasar a pilotaje.
        </p>
      </header>

      {!puedeCrear ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tu rol actual ({roles.join(', ') || 'sin roles'}) no tiene capacidad para crear retos.
          Solicita al Coordinador de Banco asignarte el rol <strong>ELABORADOR</strong>.
        </div>
      ) : (
        <NuevoRetoForm locale={locale} />
      )}
    </div>
  );
}
