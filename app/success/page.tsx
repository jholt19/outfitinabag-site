"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clearCart } from "../../lib/cart";

export default function SuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function run() {
      if (!sessionId) return;
      setStatus("saving");

      try {
        const res = await fetch("/api/save-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Save failed");

        clearCart();
        setStatus("saved");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Failed to save order");
      }
    }
    run();
  }, [sessionId]);

  return (
    <div style={{ border: "1px solid #eee", background: "white", borderRadius: 16, padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Payment successful 🎉</h1>

      {!sessionId ? (
        <p style={{ color: "#b00020", fontWeight: 900 }}>Missing session_id.</p>
      ) : status === "saving" ? (
        <p style={{ fontWeight: 900 }}>Saving your order...</p>
      ) : status === "saved" ? (
        <p style={{ fontWeight: 900 }}>Order saved! 🎉</p>
      ) : status === "error" ? (
        <p style={{ color: "#b00020", fontWeight: 900 }}>Save failed: {message}</p>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <Link href="/outfits" style={btnPrimary}>Keep shopping →</Link>
        <Link href="/my-orders" style={btnSecondary}>My Orders</Link>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: 12,
  background: "#111",
  color: "white",
  textDecoration: "none",
  fontWeight: 950,
};

const btnSecondary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  color: "#111",
  textDecoration: "none",
  fontWeight: 950,
};
