import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "outfitinabag/bundles",
    });

    return NextResponse.json({
      ok: true,
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error?.message || String(error),
        envCheck: {
          hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
          hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          hasApiKey: !!process.env.CLOUDINARY_API_KEY,
          hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
        },
      },
      { status: 500 }
    );
  }
}