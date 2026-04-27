import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const session_id = body?.session_id;

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      session_id,
      message: "save-order route is working",
    });
  } catch (error) {
    console.error("save-order POST error:", error);

    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    );
  }
}