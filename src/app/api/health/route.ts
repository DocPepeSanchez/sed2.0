import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  try {
    const r = await db.execute(sql`select 1 as ok`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbOk = ((r as any).rows ?? [])[0]?.ok === 1;
  } catch {
    dbOk = false;
  }
  return NextResponse.json({
    name: 'SED 2.0',
    version: '2.0.0',
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'up' : 'down',
    timestamp: new Date().toISOString(),
  });
}
