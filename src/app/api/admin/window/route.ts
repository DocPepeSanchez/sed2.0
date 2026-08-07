import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/store";

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return NextResponse.json({ window: db().window });
}

export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { opensAt, closesAt, open } = await req.json();
  const d = db();
  if (typeof opensAt === "string") d.window.opensAt = opensAt;
  if (typeof closesAt === "string") d.window.closesAt = closesAt;
  if (typeof open === "boolean") d.window.open = open;
  appendAudit(d.audit, {
    actor: admin.username,
    action: "WINDOW_UPDATE",
    detail: `open=${d.window.open}`,
    syncEventId: `win-${d.audit.length}`,
  });
  return NextResponse.json({ window: d.window });
}
