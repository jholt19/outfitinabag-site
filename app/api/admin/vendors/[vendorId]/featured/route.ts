import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  await requireAdmin();

  const { vendorId } = await params;
  const formData = await req.formData();

  const isFeatured = String(formData.get("isFeatured")) === "true";

  await prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      isFeatured,
    },
  });

  return NextResponse.redirect(
    new URL("/admin/vendors?success=featured-updated", req.url)
  );
}