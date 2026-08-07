import { NextResponse } from "next/server";
import {
  FlowError,
  presentCurrentItem,
  startStudentSession,
} from "@/lib/session-service";
import { serializePresented } from "@/lib/serialize";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ error: "Token requerido." }, { status: 400 });
    }
    const session = startStudentSession(token.trim());
    const presented = presentCurrentItem(session);
    return NextResponse.json({
      sessionId: session.id,
      presented: serializePresented(presented),
    });
  } catch (e) {
    if (e instanceof FlowError) {
      return NextResponse.json({ error: e.message }, { status: e.code });
    }
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
