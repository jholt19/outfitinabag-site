import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const imageUrl = String(body.imageUrl || "").trim();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL" },
        { status: 400 }
      );
    }

    /*
      For now:
      This accepts a hosted image URL and stores it in Cloudinary.

      Next step:
      direct drag/drop upload widget
    */

    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "outfitinabag/bundles",
    });

    return NextResponse.json({
      ok: true,
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}