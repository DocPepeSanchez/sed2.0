import { LoginForm } from '@/components/auth/LoginForm';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/security/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const sess = await getSession();
  if (sess.sujeto) redirect(`/${locale}`);

  const t = await getTranslations('auth');

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{t('iniciarSesion')}</h1>
      <p className="mb-8 text-sm text-slate-600">
        Acceso para personal CEEEY, docentes y aplicadores. Estudiantes y tutores ingresan
        con CURP desde el portal de aplicación.
      </p>

      <LoginForm locale={locale} />

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <p className="font-semibold">Cuentas demo (solo para esta instancia pública)</p>
        <ul className="mt-2 space-y-1 font-mono">
          <li>director@demo.sed.yucatan.gob.mx · Director General</li>
          <li>psicometria@demo.sed.yucatan.gob.mx · Psicometrista</li>
          <li>docente@demo.sed.yucatan.gob.mx · Docente bilingüe</li>
          <li>aplicador@demo.sed.yucatan.gob.mx · Aplicador</li>
          <li className="pt-1">Contraseña común: <code>Demo2026Sed!</code></li>
        </ul>
      </section>
    </div>
  );
}
