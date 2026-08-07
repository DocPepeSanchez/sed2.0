import type { PresentedItem } from "./session-service";

// Serializa un reactivo presentado sin exponer la respuesta correcta,
// respetando el orden barajado (Fisher-Yates) del paso 1B.
export function serializePresented(p: PresentedItem) {
  const optionsById = new Map(p.item.step1b.options.map((o) => [o.id, o]));
  return {
    index: p.index,
    total: p.total,
    itemId: p.item.id,
    bank: p.item.bank,
    stem: p.item.stem,
    coordinate: p.item.coordinate,
    step1a: p.item.step1a,
    step1b: {
      prompt: p.item.step1b.prompt,
      options: p.order1b.map((id) => optionsById.get(id)!),
    },
    step1c: p.item.step1c,
    order1b: p.order1b,
  };
}
