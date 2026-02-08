"use client";

import { useState } from "react";

export default function VendorApplyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setResult(null);

    const r = await fetch("/api/vendor/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await r.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Vendor Application</h1>
      <p style={{ color: "#666" }}>
        Apply to sell complete outfit bundles on OutfitInABag. After applying, save your Vendor ID + Vendor Key.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        <input placeholder="Vendor Name" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        <button onClick={submit} disabled={loading} style={btn}>
          {loading ? "Submitting…" : "Apply"}
        </button>
      </div>

      {result && (
        <pre style={{ marginTop: 14, background: "#111", color: "white", padding: 12, borderRadius: 12, overflow: "auto" }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
export default function VendorApplyPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Vendor Apply ✅</h1>
      <p>This page is working.</p>
    </main>
  );
}
