import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

function bad(res: NextApiResponse, msg: string, code = 400) {
  return res.status(code).json({ ok: false, error: msg });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const vendorId = req.headers["x-vendor-id"] ? String(req.headers["x-vendor-id"]) : "";
  const apiKey = req.headers["x-vendor-key"] ? String(req.headers["x-vendor-key"]) : "";

  if (!vendorId || !apiKey) return bad(res, "Missing vendor credentials", 401);

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.apiKey !== apiKey) return bad(res, "Unauthorized", 401);

  if (vendor.status !== "APPROVED") return bad(res, "Vendor not approved yet", 403);

  if (req.method === "GET") {
    const bundles = await prisma.bundle.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.status(200).json({ ok: true, bundles });
  }

  if (req.method === "POST") {
    const { title, occasion, description, price, image } = req.body || {};

    if (!title || !occasion || !description || !price) return bad(res, "Missing fields");
    const occ = String(occasion).toUpperCase();
    if (!["VACATION", "FORMAL", "CASUAL", "WEDDING"].includes(occ)) return bad(res, "Invalid occasion");

    const cents = Number(price);
    if (!Number.isFinite(cents) || cents <= 0) return bad(res, "Invalid price (cents)");

    const bundle = await prisma.bundle.create({
      data: {
        vendorId,
        title: String(title).trim(),
        occasion: occ as any,
        description: String(description).trim(),
        price: Math.round(cents),
        image: image ? String(image).trim() : null,
      },
    });

    return res.status(200).json({ ok: true, bundle });
  }

  if (req.method === "PATCH") {
    const { id, isActive } = req.body || {};
    if (!id) return bad(res, "Missing bundle id");

    const updated = await prisma.bundle.update({
      where: { id: String(id) },
      data: { isActive: Boolean(isActive) },
    });

    return res.status(200).json({ ok: true, bundle: updated });
  }

  return bad(res, "Method not allowed", 405);
}
