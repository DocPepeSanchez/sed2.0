import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { verifyChain } from "@/lib/audit";
import { db } from "@/lib/store";

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const d = db();
  return NextResponse.json({
    valid: verifyChain(d.audit),
    entries: d.audit.slice(-100),
  });
}
