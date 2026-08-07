"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Presented {
  index: number;
  total: number;
  itemId: string;
  bank: string;
  stem: string;
  coordinate: { facione: string; nivel: string };
  step1a: { prompt: string };
  step1b: { prompt: string; options: { id: string; text: string }[] };
  step1c: {
    prompt: string;
    options: { id: string; text: string; value: number }[];
  };
  order1b: string[];
}

type Step = 1 | 2 | 3;

function uuid(): string {
  return crypto.randomUUID();
}

export default function EvaluationFlow() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [presented, setPresented] = useState<Presented | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("sed_session");
    const raw = sessionStorage.getItem("sed_presented");
    if (!id || !raw) {
      router.replace("/login");
      return;
    }
    setSessionId(id);
    setPresented(JSON.parse(raw));
    setStartedAt(new Date().toISOString());
  }, [router]);

  function resetForNext(next: Presented) {
    setPresented(next);
    setStep(1);
    setA("");
    setB("");
    setC("");
    setStartedAt(new Date().toISOString());
  }

  async function commit() {
    if (!presented || !sessionId) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/student/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: presented.itemId,
          step1a: a,
          step1b: b,
          step1c: c,
          presentedOrder1b: presented.order1b,
          startedAt,
          syncEventId: uuid(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No fue posible registrar la respuesta.");
        return;
      }
      if (data.finished) {
        sessionStorage.removeItem("sed_session");
        sessionStorage.removeItem("sed_presented");
        setFinished(true);
        return;
      }
      resetForNext(data.presented);
    } catch {
      setError("Error de red. Reintenta.");
    } finally {
      setBusy(false);
    }
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="card">
          <h1 className="mb-2 text-2xl font-bold text-berry">
            Evaluación finalizada
          </h1>
          <div className="gold-rule mx-auto mb-4 w-16" />
          <p className="text-ink">
            Gracias por completar la evaluación. Tus respuestas fueron
            registradas.
          </p>
        </div>
      </div>
    );
  }

  if (!presented) {
    return <p className="text-center text-ink">Cargando…</p>;
  }

  const progress = (presented.index / presented.total) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progreso */}
      <div className="mb-2 flex items-center justify-between text-sm text-ink">
        <span>
          Reactivo {presented.index + 1} de {presented.total}
        </span>
        <span className="badge bg-crema text-berry">Banco {presented.bank}</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-crema">
        <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
      </div>

      <div className="card">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
          {presented.coordinate.facione} · {presented.coordinate.nivel}
        </p>
        <p className="mb-4 text-base font-semibold text-ink">{presented.stem}</p>
        <div className="gold-line mb-6" />

        {/* Indicador de pasos */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-berry" : "bg-crema"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p className="mb-1 text-sm font-semibold text-berry">
              Paso 1A · Producción abierta
            </p>
            <label className="field-label">{presented.step1a.prompt}</label>
            <textarea
              className="field-input min-h-[120px]"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="Escribe tu respuesta…"
            />
            <button className="btn-berry mt-5 w-full" onClick={() => setStep(2)}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-1 text-sm font-semibold text-berry">
              Paso 1B · Reconocimiento
            </p>
            <label className="field-label">{presented.step1b.prompt}</label>
            <div className="space-y-2">
              {presented.step1b.options.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${
                    b === o.id ? "border-berry bg-crema" : "border-crema bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="b"
                    value={o.id}
                    checked={b === o.id}
                    onChange={() => setB(o.id)}
                    className="accent-berry"
                  />
                  <span className="text-sm text-ink">{o.text}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setStep(1)}>
                Atrás
              </button>
              <button
                className="btn-berry flex-1"
                disabled={!b}
                onClick={() => setStep(3)}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-1 text-sm font-semibold text-berry">
              Paso 1C · Autorreporte
            </p>
            <label className="field-label">{presented.step1c.prompt}</label>
            <div className="space-y-2">
              {presented.step1c.options.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${
                    c === o.id ? "border-berry bg-crema" : "border-crema bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="c"
                    value={o.id}
                    checked={c === o.id}
                    onChange={() => setC(o.id)}
                    className="accent-berry"
                  />
                  <span className="text-sm text-ink">{o.text}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="mt-3 text-sm font-semibold text-berry">{error}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setStep(2)}>
                Atrás
              </button>
              <button
                className="btn-berry flex-1"
                disabled={!c || busy}
                onClick={commit}
              >
                {busy ? "Registrando…" : "Registrar reactivo"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
