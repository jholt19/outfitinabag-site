import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const VALID_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function trackingLink(carrier?: string | null, tracking?: string | null) {
  if (!carrier || !tracking) return null;

  const c = carrier.toUpperCase();

  if (c.includes("UPS")) {
    return `https://www.ups.com/track?tracknum=${tracking}`;
  }

  if (c.includes("USPS")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`;
  }

  if (c.includes("FEDEX")) {
    return `https://www.fedex.com/fedextrack/?tracknumbers=${tracking}`;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    console.log("[SHIPMENT_EMAIL] route hit");

    const { userId } = await auth();

    if (!userId) {
      console.log("[SHIPMENT_EMAIL] no user");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        clerkUserId: userId,
      },
    });

    if (!vendor) {
      console.log("[SHIPMENT_EMAIL] vendor not found");
      return NextResponse.redirect(new URL("/vendor/claim", req.url));
    }

    const formData = await req.formData();

    const orderItemId = String(formData.get("orderItemId") || "");

    const fulfillmentStatus = String(
      formData.get("fulfillmentStatus") || "PENDING"
    ).toUpperCase();

    const trackingNumber = String(formData.get("trackingNumber") || "").trim();

    const trackingCarrier = String(formData.get("trackingCarrier") || "").trim();

    console.log("[SHIPMENT_EMAIL] form data", {
      orderItemId,
      fulfillmentStatus,
      trackingNumber,
      trackingCarrier,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
    });

    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      console.log("[SHIPMENT_EMAIL] invalid status");
      return NextResponse.redirect(
        new URL("/vendor/orders?error=invalid-status", req.url)
      );
    }

    const existingItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        vendorId: vendor.id,
      },
      include: {
        order: true,
      },
    });

    if (!existingItem) {
      console.log("[SHIPMENT_EMAIL] item not found");
      return NextResponse.redirect(
        new URL("/vendor/orders?error=not-found", req.url)
      );
    }

    console.log("[SHIPMENT_EMAIL] existing item", {
      itemId: existingItem.id,
      orderEmail: existingItem.order?.email,
      oldStatus: existingItem.fulfillmentStatus,
    });

    const updatedItem = await prisma.orderItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        fulfillmentStatus,
        trackingNumber: trackingNumber.length > 0 ? trackingNumber : null,
        trackingCarrier: trackingCarrier.length > 0 ? trackingCarrier : null,
      },
      include: {
        order: true,
      },
    });

    console.log("[SHIPMENT_EMAIL] updated item", {
      itemId: updatedItem.id,
      orderEmail: updatedItem.order?.email,
      newStatus: updatedItem.fulfillmentStatus,
      newTrackingNumber: updatedItem.trackingNumber,
      newTrackingCarrier: updatedItem.trackingCarrier,
    });

    const shouldEmailCustomer =
      Boolean(updatedItem.order?.email) &&
      (fulfillmentStatus === "SHIPPED" || fulfillmentStatus === "DELIVERED");

    console.log("[SHIPMENT_EMAIL] should email", {
      shouldEmailCustomer,
      orderEmail: updatedItem.order?.email,
      fulfillmentStatus,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
    });

    if (shouldEmailCustomer && process.env.RESEND_API_KEY) {
      const trackUrl = trackingLink(
        updatedItem.trackingCarrier,
        updatedItem.trackingNumber
      );

      console.log("[SHIPMENT_EMAIL] sending email", {
        to: updatedItem.order.email,
        trackUrl,
      });

      const result = await resend.emails.send({
        from: "OutfitInABag <orders@outfitinabag.com>",
        to: updatedItem.order.email!,
        subject:
          fulfillmentStatus === "DELIVERED"
            ? "Your OutfitInABag order was delivered"
            : "Your OutfitInABag order has shipped",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2>Order Update</h2>
            <p>Your item has been updated:</p>
            <p><strong>${updatedItem.title}</strong></p>
            <p>Status: <strong>${fulfillmentStatus}</strong></p>
            ${
              updatedItem.trackingCarrier
                ? `<p>Carrier: <strong>${updatedItem.trackingCarrier}</strong></p>`
                : ""
            }
            ${
              updatedItem.trackingNumber
                ? `<p>Tracking Number: <strong>${updatedItem.trackingNumber}</strong></p>`
                : ""
            }
            ${
              trackUrl
                ? `<p><a href="${trackUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold;">Track Package</a></p>`
                : ""
            }
            <p>Thank you for shopping with OutfitInABag.</p>
          </div>
        `,
      });

      console.log("[SHIPMENT_EMAIL] resend result", result);
    } else {
      console.log("[SHIPMENT_EMAIL] skipped sending");
    }

    return NextResponse.redirect(
      new URL("/vendor/orders?success=updated", req.url)
    );
  } catch (error) {
    console.error("[SHIPMENT_EMAIL] error", error);

    return NextResponse.redirect(
      new URL("/vendor/orders?error=server-error", req.url)
    );
  }
}