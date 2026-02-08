import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

function adminOk(req: NextApiRequest) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: "Unauthorized" });

  if (req.method === "GET") {
    const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ ok: true, vendors });
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ ok: false, error: "Missing id/status" });

    const up = await prisma.vendor.update({
      where: { id: String(id) },
      data: { status: String(status).toUpperCase() },
    });

    return res.status(200).json({ ok: true, vendor: up });
  }

  res.status(405).json({ ok: false, error: "Method not allowed" });
}
