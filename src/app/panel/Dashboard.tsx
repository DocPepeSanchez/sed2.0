"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TokenRow {
  token: string;
  studentId: string;
  instrumentId: string;
  used: boolean;
}

interface SessionRow {
  id: string;
  studentId: string;
  bank: string;
  state: string;
  progress: string;
  accuracy: number;
  finishedAt: string | null;
}

interface AuditRow {
  seq: number;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  hash: string;
}

interface WindowState {
  open: boolean;
  opensAt: string;
  closesAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [chainValid, setChainValid] = useState(true);
  const [win, setWin] = useState<WindowState | null>(null);
  const [newStudent, setNewStudent] = useState("");
  const [newInstrument, setNewInstrument] = useState("INST-A");

  const load = useCallback(async () => {
    const [t, p, a, w] = await Promise.all([
      fetch("/api/admin/tokens").then((r) => r.json()),
      fetch("/api/admin/progress").then((r) => r.json()),
      fetch("/api/admin/audit").then((r) => r.json()),
      fetch("/api/admin/window").then((r) => r.json()),
    ]);
    setTokens(t.tokens ?? []);
    setSessions(p.sessions ?? []);
    setAudit((a.entries ?? []).slice().reverse());
    setChainValid(a.valid ?? true);
    setWin(w.window ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createToken() {
    await fetch("/api/admin/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: newStudent || undefined,
        instrumentId: newInstrument,
      }),
    });
    setNewStudent("");
    load();
  }

  async function toggleWindow() {
    if (!win) return;
    await fetch("/api/admin/window", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ open: !win.open }),
    });
    load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/login?admin=1");
  }

  return (
    <div className="space-y-8">
      {/* Barra superior de acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-outline" onClick={load}>
          Actualizar
        </button>
        <a className="btn-gold" href="/api/admin/export">
          Exportar dataset CSV
        </a>
        <button className="btn-outline ml-auto" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      {/* Ventana de aplicacion */}
      <section className="card">
        <h2 className="mb-3 text-lg font-bold text-berry">
          Ventana de aplicación
        </h2>
        {win && (
          <div className="flex flex-wrap items-center gap-4">
            <span
              className={`badge ${
                win.open ? "bg-berry text-white" : "bg-crema text-ink"
              }`}
            >
              {win.open ? "Abierta" : "Cerrada"}
            </span>
            <span className="text-sm text-ink">
              {new Date(win.opensAt).toLocaleString("es-MX")} —{" "}
              {new Date(win.closesAt).toLocaleString("es-MX")}
            </span>
            <button className="btn-berry ml-auto" onClick={toggleWindow}>
              {win.open ? "Cerrar ventana" : "Abrir ventana"}
            </button>
          </div>
        )}
      </section>

      {/* Generacion de tokens */}
      <section className="card">
        <h2 className="mb-3 text-lg font-bold text-berry">
          Tokens de estudiante
        </h2>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="field-label">Identificador (opcional)</label>
            <input
              className="field-input"
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              placeholder="EST-004"
            />
          </div>
          <div>
            <label className="field-label">Instrumento</label>
            <select
              className="field-input"
              value={newInstrument}
              onChange={(e) => setNewInstrument(e.target.value)}
            >
              <option value="INST-A">Banco A — Plan 2022 NEM</option>
              <option value="INST-B">Banco B — MCCEMS 21/08/25</option>
            </select>
          </div>
          <button className="btn-berry" onClick={createToken}>
            Generar token
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema text-left text-gold-dark">
                <th className="py-2">Token</th>
                <th>Estudiante</th>
                <th>Instrumento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.token} className="border-b border-crema/60">
                  <td className="py-2 font-mono">{t.token}</td>
                  <td>{t.studentId}</td>
                  <td>{t.instrumentId}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.used ? "bg-crema text-ink" : "bg-berry text-white"
                      }`}
                    >
                      {t.used ? "Usado" : "Disponible"}
                    </span>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-ink">
                    Sin tokens.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monitoreo de progreso */}
      <section className="card">
        <h2 className="mb-3 text-lg font-bold text-berry">
          Monitoreo de sesiones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema text-left text-gold-dark">
                <th className="py-2">Estudiante</th>
                <th>Banco</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th>Aciertos</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-crema/60">
                  <td className="py-2">{s.studentId}</td>
                  <td>{s.bank}</td>
                  <td>{s.state}</td>
                  <td>{s.progress}</td>
                  <td>{Math.round(s.accuracy * 100)}%</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-ink">
                    Aún no hay sesiones iniciadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Auditoria */}
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-berry">
            Auditoría (cadena SHA-256)
          </h2>
          <span
            className={`badge ${
              chainValid ? "bg-berry text-white" : "bg-red-600 text-white"
            }`}
          >
            {chainValid ? "Cadena íntegra" : "Cadena comprometida"}
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema text-left text-gold-dark">
                <th className="py-2">#</th>
                <th>Actor</th>
                <th>Acción</th>
                <th>Detalle</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((e) => (
                <tr key={e.seq} className="border-b border-crema/60">
                  <td className="py-2">{e.seq}</td>
                  <td>{e.actor}</td>
                  <td>{e.action}</td>
                  <td className="max-w-xs truncate">{e.detail}</td>
                  <td className="font-mono text-xs">{e.hash.slice(0, 12)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
