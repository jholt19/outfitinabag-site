import { NextResponse } from "next/server";

export async function GET() {
  // Always return 200 so Vercel + your browser never see a hard failure.
  // We’ll *try* DB and report status instead of crashing the route.
  try {
    const { prisma } = await import("../../../lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: true, db: "down", error: e?.message || String(e) },
      { status: 200 }
    );
  }
}

