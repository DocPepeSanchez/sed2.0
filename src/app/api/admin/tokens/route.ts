import { NextResponse } from "next/server";
import { newToken } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/store";

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const d = db();
  const tokens = [...d.tokens.values()].map((t) => ({
    token: t.token,
    studentId: t.studentId,
    instrumentId: t.instrumentId,
    used: t.used,
    createdAt: t.createdAt,
  }));
  return NextResponse.json({ tokens });
}

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { studentId, instrumentId } = await req.json();
  const d = db();
  if (!d.instruments.has(String(instrumentId))) {
    return NextResponse.json({ error: "Instrumento inválido." }, { status: 400 });
  }
  const token = newToken("EST");
  d.tokens.set(token, {
    token,
    studentId: String(studentId ?? `EST-${d.tokens.size + 1}`),
    instrumentId: String(instrumentId),
    used: false,
    createdAt: new Date().toISOString(),
  });
  appendAudit(d.audit, {
    actor: admin.username,
    action: "TOKEN_CREATE",
    detail: `student=${studentId} instrumento=${instrumentId}`,
    syncEventId: `tok-${token}`,
  });
  return NextResponse.json({ token });
}
