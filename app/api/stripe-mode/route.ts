export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || "";

  let stripeMode = "unknown";

  if (key.startsWith("sk_live_")) {
    stripeMode = "live";
  }

  if (key.startsWith("sk_test_")) {
    stripeMode = "test";
  }

  return Response.json({
    stripeMode,
    keyPresent: Boolean(key),
    vercelEnvironment: process.env.VERCEL_ENV || null,
    deploymentUrl: process.env.VERCEL_URL || null,
  });
}