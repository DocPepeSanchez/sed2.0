import { NextResponse } from "next/server";
import {
  commitItem,
  FlowError,
  getSession,
  presentCurrentItem,
} from "@/lib/session-service";
import { serializePresented } from "@/lib/serialize";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = getSession(body.sessionId);
    const updated = commitItem(session, {
      itemId: body.itemId,
      step1a: body.step1a ?? "",
      step1b: body.step1b,
      step1c: body.step1c,
      presentedOrder1b: body.presentedOrder1b ?? [],
      startedAt: body.startedAt ?? new Date().toISOString(),
      syncEventId: body.syncEventId,
    });

    if (updated.state === "FINALIZADO") {
      return NextResponse.json({ finished: true, state: updated.state });
    }
    const presented = presentCurrentItem(updated);
    return NextResponse.json({
      finished: false,
      state: updated.state,
      presented: serializePresented(presented),
    });
  } catch (e) {
    if (e instanceof FlowError) {
      return NextResponse.json({ error: e.message }, { status: e.code });
    }
    const msg = e instanceof Error ? e.message : "Error interno.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
