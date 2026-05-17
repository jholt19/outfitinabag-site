import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();

  const email =
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";

  const admins =
    process.env.ADMIN_EMAILS?.split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean) || [];

  return Response.json({
    isAdmin: !!email && admins.includes(email),
  });
}