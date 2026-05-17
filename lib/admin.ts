import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();

  const email =
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";

  const admins =
    process.env.ADMIN_EMAILS?.split(",")
      .map((x) => x.trim().toLowerCase()) || [];

  const isAdmin = admins.includes(email);

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  return {
    userId,
    email,
  };
}