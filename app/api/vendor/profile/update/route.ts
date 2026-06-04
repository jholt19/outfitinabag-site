import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  if (!vendor) {
    return NextResponse.redirect(new URL("/vendor/claim", req.url));
  }

  const formData = await req.formData();

  await prisma.vendor.update({
    where: {
      id: vendor.id,
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
    new URL("/vendor/profile?success=updated", req.url)
  );
}