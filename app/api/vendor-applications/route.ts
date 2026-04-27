import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const brandName = String(body.brandName || "").trim();
    const contactEmail = String(body.contactEmail || "").trim();
    const website = String(body.website || "").trim();
    const instagram = String(body.instagram || "").trim();
    const products = String(body.products || "").trim();

    if (!brandName || !contactEmail || !products) {
      return NextResponse.json(
        { error: "Brand name, contact email, and products are required." },
        { status: 400 }
      );
    }

    const application = await prisma.vendorApplication.create({
      data: {
        brandName,
        contactEmail,
        website: website || null,
        instagram: instagram || null,
        products,
      },
    });

    return NextResponse.json({ ok: true, application });
  } catch (error) {
    console.error("Vendor application error:", error);

    return NextResponse.json(
      { error: "Failed to submit vendor application." },
      { status: 500 }
    );
  }
}