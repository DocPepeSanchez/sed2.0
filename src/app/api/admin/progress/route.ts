import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { buildProfile } from "@/lib/scoring";
import { db } from "@/lib/store";

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const d = db();
  const sessions = [...d.sessions.values()].map((s) => {
    const inst = d.instruments.get(s.instrumentId)!;
    const profile = buildProfile(s, d.items);
    return {
      id: s.id,
      studentId: s.studentId,
      bank: s.bank,
      state: s.state,
      progress: `${s.responses.length}/${inst.itemIds.length}`,
      accuracy: Number(profile.accuracy.toFixed(2)),
      finishedAt: s.finishedAt ?? null,
    };
  });
  return NextResponse.json({
    sessions,
    totals: {
      sessions: sessions.length,
      finished: sessions.filter((s) => s.state === "FINALIZADO").length,
    },
  });
}
