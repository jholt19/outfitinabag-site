import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/account");
  }

  const user = await currentUser();

  const email =
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";

  const admins =
    process.env.ADMIN_EMAILS?.split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean) || [];

  if (!admins.includes(email)) {
    redirect("/account");
  }

  return {
    userId,
    email,
  };
}