"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "student" | "admin";

export default function LoginTabs() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(params.get("admin") ? "admin" : "student");

  return (
    <div>
      <div className="mb-6 flex overflow-hidden rounded-md border border-crema">
        <button
          className={`flex-1 px-4 py-2 text-sm font-semibold ${
            tab === "student" ? "bg-berry text-white" : "bg-white text-ink"
          }`}
          onClick={() => setTab("student")}
        >
          Estudiante
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-semibold ${
            tab === "admin" ? "bg-berry text-white" : "bg-white text-ink"
          }`}
          onClick={() => setTab("admin")}
        >
          Administración
        </button>
      </div>

      {tab === "student" ? (
        <StudentForm router={router} />
      ) : (
        <AdminForm router={router} />
      )}
    </div>
  );
}

function StudentForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No fue posible iniciar.");
        return;
      }
      sessionStorage.setItem("sed_session", data.sessionId);
      sessionStorage.setItem("sed_presented", JSON.stringify(data.presented));
      router.push("/evaluacion");
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <label className="field-label" htmlFor="token">
        Token de acceso (un solo uso)
      </label>
      <input
        id="token"
        className="field-input"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="EST-XXXXXXXXXX"
        autoComplete="off"
      />
      {error && <p className="mt-3 text-sm font-semibold text-berry">{error}</p>}
      <button className="btn-berry mt-5 w-full" disabled={loading}>
        {loading ? "Iniciando…" : "Comenzar evaluación"}
      </button>
    </form>
  );
}

function AdminForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No fue posible ingresar.");
        return;
      }
      router.push("/panel");
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <label className="field-label" htmlFor="username">
        Usuario
      </label>
      <input
        id="username"
        className="field-input mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />
      <label className="field-label" htmlFor="password">
        Contraseña
      </label>
      <input
        id="password"
        type="password"
        className="field-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <p className="mt-3 text-sm font-semibold text-berry">{error}</p>}
      <button className="btn-berry mt-5 w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
