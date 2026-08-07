import type {
  FacioneSkill,
  Item,
  ItemResponse,
  Session,
} from "./types";

export interface ItemScore {
  itemId: string;
  bank: string;
  correct1b: boolean; // discriminativa
  confidence1c: number; // autorreporte procedimental (valor de escala)
  facione: FacioneSkill;
  nivel: string;
  // Patron inferencial detectado (P1-P8)
  pattern: string;
}

export interface CognitiveProfile {
  total: number;
  correctCount: number;
  accuracy: number;
  byFacione: Record<string, { correct: number; total: number }>;
  patternCounts: Record<string, number>;
  scores: ItemScore[];
}

// 8 patrones inferenciales P1-P8 derivados de la relacion entre
// acierto (1B) y confianza autorreportada (1C).
function classifyPattern(correct: boolean, confidence: number): string {
  const high = confidence >= 4;
  const mid = confidence === 3;
  if (correct && high) return "P1"; // dominio consolidado
  if (correct && mid) return "P2"; // acierto con confianza media
  if (correct && !high && !mid) return "P3"; // acierto con baja confianza (suerte/intuicion)
  if (!correct && high) return "P4"; // sobreconfianza / error sistematico
  if (!correct && mid) return "P5"; // error con confianza media
  return "P6"; // duda reconocida (error con baja confianza)
}

export function scoreItem(item: Item, resp: ItemResponse): ItemScore {
  const correct1b = resp.step1b === item.step1b.correctOptionId;
  const opt = item.step1c.options.find((o) => o.id === resp.step1c);
  const confidence1c = opt?.value ?? 0;
  // P7: respuesta abierta consistente pero sin marcar confianza valida
  // P8: respuesta abierta vacia en 1A pese a continuar (señal de evitacion)
  let pattern: string;
  if (resp.step1a.trim().length === 0) {
    pattern = "P8";
  } else if (confidence1c === 0) {
    pattern = "P7";
  } else {
    pattern = classifyPattern(correct1b, confidence1c);
  }
  return {
    itemId: item.id,
    bank: item.bank,
    correct1b,
    confidence1c,
    facione: item.coordinate.facione,
    nivel: item.coordinate.nivel,
    pattern,
  };
}

export function buildProfile(
  session: Session,
  items: Map<string, Item>,
): CognitiveProfile {
  const scores: ItemScore[] = [];
  const byFacione: CognitiveProfile["byFacione"] = {};
  const patternCounts: Record<string, number> = {};

  for (const resp of session.responses) {
    const item = items.get(resp.itemId);
    if (!item) continue;
    const s = scoreItem(item, resp);
    scores.push(s);

    byFacione[s.facione] ??= { correct: 0, total: 0 };
    byFacione[s.facione].total += 1;
    if (s.correct1b) byFacione[s.facione].correct += 1;

    patternCounts[s.pattern] = (patternCounts[s.pattern] ?? 0) + 1;
  }

  const correctCount = scores.filter((s) => s.correct1b).length;
  return {
    total: scores.length,
    correctCount,
    accuracy: scores.length ? correctCount / scores.length : 0,
    byFacione,
    patternCounts,
    scores,
  };
}
