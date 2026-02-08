import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthed(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token && token === process.env.ADMIN_TOKEN;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, vendors });
}

export async function PATCH(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, status } = body;

  if (!id || !status) return NextResponse.json({ ok: false, error: "Missing id/status" }, { status: 400 });

  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, vendor });
}
