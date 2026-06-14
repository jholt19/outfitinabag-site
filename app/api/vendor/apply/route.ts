import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function makeApiKey() {
  return "vnd_" + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: Request) {
  try {
    const { name, email, website, instagram, referralCode } = await req.json();

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanWebsite = String(website || "").trim();
    const cleanInstagram = String(instagram || "").trim();
    const cleanReferralCode = String(referralCode || "").trim();

    if (!cleanName || !cleanEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingVendor) {
      return NextResponse.json(
        {
          ok: false,
          error: "A vendor with this email already exists.",
        },
        { status: 400 }
      );
    }

    const referringVendor = cleanReferralCode
      ? await prisma.vendor.findFirst({
          where: {
            OR: [
              {
                apiKey: cleanReferralCode,
              },
              {
                id: cleanReferralCode,
              },
            ],
          },
        })
      : null;

    const vendor = await prisma.vendor.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        website: cleanWebsite || null,
        instagram: cleanInstagram || null,
        apiKey: makeApiKey(),
        status: "PENDING",
      },
    });

    let referral = null;

    if (referringVendor) {
      referral = await prisma.vendorReferral.create({
        data: {
          referrerVendorId: referringVendor.id,
          referredVendorId: vendor.id,
          referralCode: cleanReferralCode,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      vendor,
      referral,
      message: referringVendor
        ? "Vendor application submitted with referral."
        : "Vendor application submitted.",
    });
  } catch (error: any) {
    console.error("Vendor apply error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Vendor application failed.",
      },
      { status: 500 }
    );
  }
}