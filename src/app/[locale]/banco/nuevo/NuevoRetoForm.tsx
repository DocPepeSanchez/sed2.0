'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const CAMPOS = [
  { codigo: 'L', nombre: 'Lenguajes' },
  { codigo: 'C', nombre: 'Saberes y Pensamiento Científico' },
  { codigo: 'E', nombre: 'Ética, Naturaleza y Sociedades' },
  { codigo: 'H', nombre: 'De lo Humano y lo Comunitario' },
] as const;

const TIPOS = [
  { codigo: 'CERRADO_OPCION_MULTIPLE', nombre: 'Cerrado · Opción múltiple' },
  { codigo: 'CERRADO_SELECCION', nombre: 'Cerrado · Selección múltiple' },
  { codigo: 'CERRADO_TEI', nombre: 'Cerrado · TEI (arrastrar/zona activa)' },
  { codigo: 'ABIERTO_CORTO', nombre: 'Abierto corto' },
  { codigo: 'ABIERTO_CONSTRUIDO', nombre: 'Abierto construido' },
] as const;

export function NuevoRetoForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [clave, setClave] = useState('');
  const [campo, setCampo] = useState<'L' | 'C' | 'E' | 'H'>('L');
  const [fase, setFase] = useState(3);
  const [grado, setGrado] = useState(1);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]['codigo']>('CERRADO_OPCION_MULTIPLE');
  const [idioma, setIdioma] = useState<'spa' | 'yua'>('spa');
  const [tiempoEstimadoSeg, setTiempo] = useState(60);
  const [enunciadoQti, setEnunciado] = useState('');
  const [respuestaModelo, setRespuesta] = useState('');
  const [claveCorrectas, setClaveCorrectas] = useState('');

  const inputCls =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-berry-600 focus:outline-none focus:ring-2 focus:ring-berry-500';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setEnviando(true);
    try {
      const esCerrado = tipo.startsWith('CERRADO');
      const claveRespuesta = esCerrado
        ? {
            correctas: claveCorrectas
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : undefined;

      const res = await fetch('/api/v1/retos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clave,
          campo,
          fase,
          grado,
          tipo,
          idioma,
          tiempoEstimadoSeg,
          enunciadoQti,
          respuestaModelo: respuestaModelo || undefined,
          claveRespuesta,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.mensaje || body.error || `Error ${res.status}`);
        return;
      }
      setMensaje(`Reto ${clave} creado en estado CREADO. Versión 1.0.0 inmutable.`);
      setTimeout(() => {
        router.push(`/${locale}/banco`);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError((err as Error).message ?? 'Error de red');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Campo etiqueta="Clave del reto" hint="Ej. L_F3_G2_E1_001 (RB-09)">
          <input
            required
            minLength={5}
            maxLength={40}
            value={clave}
            onChange={(e) => setClave(e.target.value.toUpperCase())}
            className={inputCls}
            placeholder="L_F3_G2_E1_001"
          />
        </Campo>

        <Campo etiqueta="Idioma">
          <select value={idioma} onChange={(e) => setIdioma(e.target.value as 'spa' | 'yua')} className={inputCls}>
            <option value="spa">Español</option>
            <option value="yua">Maya yucateco</option>
          </select>
        </Campo>

        <Campo etiqueta="Campo formativo">
          <select value={campo} onChange={(e) => setCampo(e.target.value as 'L' | 'C' | 'E' | 'H')} className={inputCls}>
            {CAMPOS.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Tipo de reto">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number]['codigo'])}
            className={inputCls}
          >
            {TIPOS.map((t) => (
              <option key={t.codigo} value={t.codigo}>
                {t.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Fase (1-6)">
          <input
            type="number"
            min={1}
            max={6}
            required
            value={fase}
            onChange={(e) => setFase(Number(e.target.value))}
            className={inputCls}
          />
        </Campo>

        <Campo etiqueta="Grado (0-12)">
          <input
            type="number"
            min={0}
            max={12}
            required
            value={grado}
            onChange={(e) => setGrado(Number(e.target.value))}
            className={inputCls}
          />
        </Campo>

        <Campo etiqueta="Tiempo estimado (segundos)">
          <input
            type="number"
            min={10}
            max={900}
            required
            value={tiempoEstimadoSeg}
            onChange={(e) => setTiempo(Number(e.target.value))}
            className={inputCls}
          />
        </Campo>
      </div>

      <Campo etiqueta="Enunciado QTI 3.0" hint="XML del cuerpo del reto (mínimo 10 caracteres).">
        <textarea
          required
          minLength={10}
          rows={6}
          value={enunciadoQti}
          onChange={(e) => setEnunciado(e.target.value)}
          className={`${inputCls} font-mono text-xs`}
          placeholder='<assessmentItem identifier="reto-001"><itemBody><p>¿…?</p></itemBody></assessmentItem>'
        />
      </Campo>

      {tipo.startsWith('CERRADO') ? (
        <Campo etiqueta="Clave correcta" hint="IDs separados por coma. Ej: A o A,C">
          <input
            value={claveCorrectas}
            onChange={(e) => setClaveCorrectas(e.target.value)}
            className={inputCls}
            placeholder="A,C"
          />
        </Campo>
      ) : (
        <Campo etiqueta="Respuesta modelo (opcional)">
          <textarea
            rows={3}
            value={respuestaModelo}
            onChange={(e) => setRespuesta(e.target.value)}
            className={inputCls}
          />
        </Campo>
      )}

      {error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {mensaje}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/banco`)}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-berry-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-berry-800 focus:outline-none focus:ring-2 focus:ring-berry-500 disabled:opacity-50"
        >
          {enviando ? 'Creando…' : 'Crear reto'}
        </button>
      </div>

    </form>
  );
}

function Campo({
  etiqueta,
  hint,
  children,
}: {
  etiqueta: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{etiqueta}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
