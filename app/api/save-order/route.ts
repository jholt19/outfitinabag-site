sing ecmascript source code failed
  23 | }
  24 |
> 25 | export async function POST(req: Request) {
     | ^^^^^^
  26 |   try {
  27 |     const body = await req.json().catch(() => null);
  28 |     const session_id = body?.session_id;
'import', and 'export' cannot be used outside of module code
    at <unknown> (./app/api/save-order/route.ts:25:1)
Error: Command "npm run vercel-build" exited with 1