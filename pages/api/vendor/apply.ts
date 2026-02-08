import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ ok: false, error: "Missing name or email" });

  const cleanEmail = String(email).trim().toLowerCase();
  const apiKey = "vnd_" + crypto.randomBytes(18).toString("hex"); // vendor secret

  try {
    const existing = await prisma.vendor.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      // re-send their apiKey (MVP convenience)
      return res.status(200).json({
        ok: true,
        vendor: { id: existing.id, status: existing.status, name: existing.name, email: existing.email },
        apiKey: existing.apiKey,
        note: "Vendor already exists. Save your apiKey.",
      });
    }

    const vendor = await prisma.vendor.create({
      data: { name: String(name).trim(), email: cleanEmail, apiKey },
    });

    return res.status(200).json({
      ok: true,
      vendor: { id: vendor.id, status: vendor.status, name: vendor.name, email: vendor.email },
      apiKey,
      note: "Save your apiKey. Admin must approve your account before you can publish bundles.",
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
