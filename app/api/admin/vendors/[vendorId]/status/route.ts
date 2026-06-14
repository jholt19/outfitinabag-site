import { NextResponse } from "next/server";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    vendorId: string;
  }>;
};

const VALID_STATUSES = ["approved", "pending", "rejected"];

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

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

  const vendor = await prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      status,
    },
  });

  const resend = getResendClient();

  if (resend && vendor.email) {
    try {
      if (status === "approved") {
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ||
            "OutfitInABag <onboarding@resend.dev>",
          to: vendor.email,
          subject: "Your OutfitInABag vendor account has been approved",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;">
              <h1>Congratulations!</h1>
              <p>Your vendor account has been approved.</p>
              <p>You can now log in and begin creating bundles, managing inventory, and selling on OutfitInABag.</p>
              <p>
                <a href="https://www.outfitinabag.com/vendor/dashboard"
                   style="display:inline-block;background:#000;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold;">
                  Open Vendor Dashboard
                </a>
              </p>
            </div>
          `,
        });
      }

      if (status === "rejected") {
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ||
            "OutfitInABag <onboarding@resend.dev>",
          to: vendor.email,
          subject: "Update regarding your OutfitInABag vendor application",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;">
              <h1>Vendor Application Update</h1>
              <p>Thank you for applying to OutfitInABag.</p>
              <p>At this time your application was not approved.</p>
              <p>You are welcome to reapply in the future as we continue expanding the marketplace.</p>
            </div>
          `,
        });
      }
    } catch (error) {
      console.error("[VENDOR_STATUS_EMAIL]", error);
    }
  }

  return NextResponse.redirect(
    new URL("/admin/vendors?success=status-updated", req.url)
  );
}
