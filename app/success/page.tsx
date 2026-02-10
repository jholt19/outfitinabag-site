"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    async function run() {
      if (!sessionId) return;

      setStatus("saving");
      try {
        const r = await fetch("/api/save-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await r.json().catch(() => ({}));

        if (!r.ok) {
          setStatus("failed");
          setMsg(data?.error || "Order save failed.");
          return;
        }

        setStatus("saved");
        setMsg("Order saved! 🎉");
      } catch (e: any) {
        setStatus("failed");
        setMsg(e?.message || "Order save failed.");
      }
    }

    run();
  }, [sessionId]);

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginBottom: 6 }}>Payment successful 🎉</h1>

      {!sessionId ? (
        <p style={{ color: "#b00", fontWeight: 700 }}>
          Missing session_id. Please return to the bag and try checkout again.
        </p>
      ) : (
        <>
          <p style={{ color: "#666" }}>Session: {sessionId}</p>

          {status === "saving" && <p style={{ fontWeight: 800 }}>Saving your order…</p>}
          {status === "saved" && <p style={{ fontWeight: 800 }}>{msg}</p>}
          {status === "failed" && (
            <p style={{ fontWeight: 800, color: "#b00" }}>
              {msg} (You can still view orders later if it saved already.)
            </p>
          )}
        </>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/outfits" style={btn}>
          Keep shopping →
        </Link>
        <Link href="/my-orders" style={btnLight}>
          View my orders
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <SuccessInner />
    </Suspense>
  );
}

const btn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  background: "#111",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 900,
};

const btnLight: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  background: "#fff",
  color: "#111",
  border: "1px solid #ddd",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 900,
};
