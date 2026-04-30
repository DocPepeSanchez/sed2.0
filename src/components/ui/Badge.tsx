import { twMerge } from 'tailwind-merge';

const VARIANTES = {
  neutro: 'bg-slate-100 text-slate-800',
  exito: 'bg-emerald-100 text-emerald-900',
  alerta: 'bg-amber-100 text-amber-900',
  critico: 'bg-red-100 text-red-900',
  info: 'bg-berry-100 text-berry-900',
  maya: 'bg-dorado-100 text-dorado-900',
} as const;

export function Badge({
  children,
  variante = 'neutro',
  className,
}: {
  children: React.ReactNode;
  variante?: keyof typeof VARIANTES;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANTES[variante],
        className,
      )}
    >
      {children}
    </span>
  );
}
