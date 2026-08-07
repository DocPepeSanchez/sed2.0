import { requireAdmin } from "@/lib/admin-auth";
import { createHash } from "node:crypto";
import { buildProfile } from "@/lib/scoring";
import { db } from "@/lib/store";

// Anonimiza el identificador de estudiante de forma estable (sin PII)
function anon(studentId: string): string {
  return "S-" + createHash("sha256").update(studentId).digest("hex").slice(0, 10);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!requireAdmin()) {
    return new Response("No autorizado.", { status: 401 });
  }
  const d = db();
  const header = [
    "sujeto_anon",
    "banco",
    "item",
    "facione",
    "nivel",
    "correcto_1b",
    "confianza_1c",
    "patron",
  ];
  const rows: string[] = [header.map(csvCell).join(",")];

  for (const s of d.sessions.values()) {
    const profile = buildProfile(s, d.items);
    for (const sc of profile.scores) {
      rows.push(
        [
          anon(s.studentId),
          sc.bank,
          sc.itemId,
          sc.facione,
          sc.nivel,
          sc.correct1b ? "1" : "0",
          sc.confidence1c,
          sc.pattern,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }

  // UTF-8 BOM para compatibilidad con Excel
  const body = "﻿" + rows.join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sed_dataset.csv"',
    },
  });
}
