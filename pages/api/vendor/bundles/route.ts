import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getVendorHeaders(req: Request) {
  const vendorId = req.headers.get("x-vendor-id") || "";
  const vendorKey = req.headers.get("x-vendor-key") || "";
  return { vendorId, vendorKey };
}

async function authedVendor(req: Request) {
  const { vendorId, vendorKey } = getVendorHeaders(req);
  if (!vendorId || !vendorKey) return null;

  const v = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!v) return null;

  // You can rename fields below if your schema uses different names:
  // expected: vendor.apiKey and vendor.status
  // status should be "APPROVED" to allow dashboard actions
  // @ts-ignore
  if (v.apiKey !== vendorKey) return null;
  // @ts-ignore
  if (v.status !== "APPROVED") return { denied: true };

  return v;
}

export async function GET(req: Request) {
  const v = await authedVendor(req);
  if (!v) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  // @ts-ignore
  if ((v as any).denied) return NextResponse.json({ ok: false, error: "Vendor not approved yet" }, { status: 403 });

  const { vendorId } = getVendorHeaders(req);

  const bundles = await prisma.bundle.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, bundles });
}

export async function POST(req: Request) {
  const v = await authedVendor(req);
  if (!v) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  // @ts-ignore
  if ((v as any).denied) return NextResponse.json({ ok: false, error: "Vendor not approved yet" }, { status: 403 });

  const { vendorId } = getVendorHeaders(req);
  const body = await req.json().catch(() => ({}));

  const title = String(body.title || "").trim();
  const occasion = String(body.occasion || "VACATION").trim().toUpperCase();
  const description = String(body.description || "").trim();
  const price = Number(body.price || 0);
  const image = body.image ? String(body.image) : null;

  if (!title || !description || !price) {
    return NextResponse.json({ ok: false, error: "Missing title/description/price" }, { status: 400 });
  }

  const bundle = await prisma.bundle.create({
    data: {
      vendorId,
      title,
      occasion,
      description,
      price,
      image,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true, bundle });
}

export async function PATCH(req: Request) {
  const v = await authedVendor(req);
  if (!v) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  // @ts-ignore
  if ((v as any).denied) return NextResponse.json({ ok: false, error: "Vendor not approved yet" }, { status: 403 });

  const { vendorId } = getVendorHeaders(req);
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const isActive = Boolean(body.isActive);

  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const bundle = await prisma.bundle.update({
    where: { id },
    data: { isActive },
  });

  // protect: vendor can only change their own bundle
  if ((bundle as any).vendorId !== vendorId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, bundle });
}
