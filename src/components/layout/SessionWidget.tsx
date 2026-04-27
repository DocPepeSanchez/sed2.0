'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UsuarioActual {
  rfc: string;
  asignaciones: Array<{ rol: string; alcance: { tipo: string; valor?: string } }>;
}

export function SessionWidget({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUsuario(d.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargado(true));
  }, []);

  if (!cargado) return null;

  if (!usuario) {
    return (
      <Link
        href={`/${locale}/login`}
        className="rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {t('iniciarSesion')}
      </Link>
    );
  }

  async function cerrarSesion() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsuario(null);
    router.push(`/${locale}`);
    router.refresh();
  }

  const rolPrincipal = usuario.asignaciones[0]?.rol ?? '';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="hidden max-w-[220px] truncate rounded bg-white/10 px-2 py-1 text-xs text-white sm:inline"
        title={`${usuario.rfc} · ${rolPrincipal}`}
      >
        {usuario.rfc}
      </span>
      <button
        type="button"
        onClick={cerrarSesion}
        className="rounded bg-white/10 px-3 py-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {tNav('salir')}
      </button>
    </div>
  );
}
