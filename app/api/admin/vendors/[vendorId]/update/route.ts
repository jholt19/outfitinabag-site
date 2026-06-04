import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    vendorId: string;
  }>;
};

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  await requireAdmin();

  const { vendorId } = await params;

  const formData = await req.formData();

  await prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim() || null,
      logo: String(formData.get("logo") || "").trim() || null,
      bannerImage: String(formData.get("bannerImage") || "").trim() || null,
      instagram: String(formData.get("instagram") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
    },
  });

  return NextResponse.redirect(
    new URL(`/admin/vendors/${vendorId}/edit?success=updated`, req.url)
  );
}