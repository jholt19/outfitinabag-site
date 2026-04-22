import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Vendor gets 80% of item total (your current rule)
function calcVendorPayoutCents(itemTotalCents: number) {
  const bps = Number(process.env.PLATFORM_FEE_BPS || 2000); // 20%
  const vendorShare = 10000 - bps;
  return Math.round((itemTotalCents * vendorShare) / 10000);


// Platform fee basis points (bps). 500 = 5%
function getPlatformFeeBps() {
  const raw = process.env.PLATFORM_FEE_BPS;
  const n = raw ? Number(raw) : 500;
  return Number.isFinite(n) && n >= 0 ? n : 500;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const session_id = body?.session_id;

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    // already saved?
    const existing = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
      include: { items: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, orderId: existing.id, existing: true });
    }

    // Build line items from Stripe
    const lineItems = (session.line_items?.data ?? []).map((li) => {
      const qty = li.quantity ?? 1;
      const unitAmount = li.price?.unit_amount ?? 0; // cents
      const total = unitAmount * qty;

      const product: any = li.price?.product;

      // IMPORTANT:
      // We expect metadata.bundleId (NOT outfitId) so payouts + FK are correct
      const bundleIdRaw = product?.metadata?.bundleId || null;

      return {
        title: product?.name ?? "Item",
        quantity: qty,
        unitPrice: unitAmount,
        image: product?.images?.[0] ?? null,
        bundleIdRaw: bundleIdRaw ? String(bundleIdRaw) : null,
        itemTotalCents: total,
      };
    });

    // FK-safe bundle lookup
    const rawIds = lineItems.map((x) => x.bundleIdRaw).filter(Boolean) as string[];
    const foundBundles = rawIds.length
      ? await prisma.bundle.findMany({
          where: { id: { in: rawIds } },
          select: { id: true, vendorId: true },
        })
      : [];

    const bundleToVendor = new Map(foundBundles.map((b) => [b.id, b.vendorId]));
    const validBundleIds = new Set(foundBundles.map((b) => b.id));

    // fallback vendor (dev safety)
    const fallbackVendorId = "dce90078-5641-4452-8add-0a7d0962d7d1";

    // --- Investor metrics ---
    const gmvCents = session.amount_total ?? 0;

    // Create items payload first so we can sum vendor payouts
    const itemsToCreate = lineItems.map((li) => {
      const bundleId = li.bundleIdRaw && validBundleIds.has(li.bundleIdRaw) ? li.bundleIdRaw : null;
      const vendorId = bundleId ? bundleToVendor.get(bundleId) : null;

      const vendorPayoutCents = calcVendorPayoutCents(li.itemTotalCents);

      return {
        title: li.title,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        image: li.image,

        // FK-safe
        bundleId,

        // payout fields
        vendorId: vendorId ?? fallbackVendorId,
        vendorPayoutCents,
        // payoutStatus defaults to PENDING via schema (if you set it)
      };
    });

    const vendorTotalCents = itemsToCreate.reduce((sum, it) => sum + (it.vendorPayoutCents ?? 0), 0);

    // Platform fee based on BPS (e.g. 5%)
    const bps = getPlatformFeeBps();
    const platformFeeCents = Math.round((gmvCents * bps) / 10000);

    // Stripe fee: keep 0 for now (exact later via Stripe balance transactions/Connect)
    const stripeFeeCents = 0;

    const netRevenueCents = platformFeeCents - stripeFeeCents;

    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        status: session.payment_status ?? null,

        // legacy order-level payout status can stay, but item-level is source of truth
        payoutStatus: "PENDING",

        // ✅ Investor metrics
        gmvCents,
        vendorTotalCents,
        platformFeeCents,
        stripeFeeCents,
        netRevenueCents,

        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err: any) {
    console.error("save-order error:", err);
    return NextResponse.json({ error: err?.message || "Save order failed" }, { status: 500 });
  }
}
