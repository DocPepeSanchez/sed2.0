'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'yua', label: 'Maaya t’aan' },
] as const;

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function cambiar(nuevo: string) {
    if (nuevo === current) return;
    const segmentos = pathname.split('/');
    segmentos[1] = nuevo;
    startTransition(() => {
      router.replace(segmentos.join('/'));
    });
  }

  return (
    <div className="flex items-center gap-1 ml-2 border-l border-ceeey-500 pl-3">
      <span className="sr-only">Cambiar idioma</span>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => cambiar(l.code)}
          aria-pressed={current === l.code}
          aria-label={`Cambiar idioma a ${l.label}`}
          disabled={isPending}
          className={`rounded px-2 py-1 text-xs font-medium ${
            current === l.code
              ? 'bg-white text-ceeey-700'
              : 'text-white hover:bg-ceeey-600 focus:bg-ceeey-600'
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
