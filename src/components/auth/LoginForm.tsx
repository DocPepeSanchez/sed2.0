'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [identificador, setIdentificador] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ identificador, contrasena }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error === 'credenciales_invalidas' ? t('errorCredenciales') : 'Error');
        return;
      }
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setError('Error de red — intente de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label={t('iniciarSesion')}>
      <div>
        <label htmlFor="identificador" className="mb-1 block text-sm font-medium text-slate-700">
          {t('rfcOCurp')} / {t('correo')}
        </label>
        <input
          id="identificador"
          name="identificador"
          type="text"
          autoComplete="username"
          required
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-ceeey-600 focus:outline-none focus:ring-2 focus:ring-ceeey-500"
        />
      </div>

      <div>
        <label htmlFor="contrasena" className="mb-1 block text-sm font-medium text-slate-700">
          {t('contrasena')}
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-ceeey-600 focus:outline-none focus:ring-2 focus:ring-ceeey-500"
        />
      </div>

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded bg-ceeey-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-ceeey-800 focus:outline-none focus:ring-2 focus:ring-ceeey-500 disabled:opacity-50"
      >
        {cargando ? '…' : t('iniciarSesion')}
      </button>
    </form>
  );
}
