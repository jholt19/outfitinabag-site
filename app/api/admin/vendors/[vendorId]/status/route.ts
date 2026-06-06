import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    vendorId: string;
  }>;
};

const VALID_STATUSES = ["approved", "pending", "rejected"];

export async function POST(req: Request, { params }: RouteContext) {
  await requireAdmin();

  const { vendorId } = await params;

  const formData = await req.formData();
  const status = String(formData.get("status") || "").toLowerCase();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.redirect(
      new URL("/admin/vendors?error=invalid-status", req.url)
    );
  }

  await prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      status,
    },
  });

  return NextResponse.redirect(
    new URL("/admin/vendors?success=status-updated", req.url)
  );
}