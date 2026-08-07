import { NextResponse } from "next/server";
import { signSession, verifyPassword } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { db } from "@/lib/store";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const d = db();
  const admin = d.admins.get(String(username ?? "").trim());
  if (!admin || !verifyPassword(String(password ?? ""), admin.passwordHash)) {
    appendAudit(d.audit, {
      actor: String(username ?? "desconocido"),
      action: "LOGIN_FAIL",
      detail: "credenciales invalidas",
      syncEventId: `loginfail-${d.audit.length}-${admin ? "u" : "x"}`,
    });
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const token = signSession({ username: admin.username, role: admin.role });
  appendAudit(d.audit, {
    actor: admin.username,
    action: "LOGIN_OK",
    detail: "ROLE_PILOT_ADMIN",
    syncEventId: `login-${d.audit.length}-${admin.username}`,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
