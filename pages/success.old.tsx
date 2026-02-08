import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Saving your order...");

  useEffect(() => {
    const session_id = router.query.session_id;
    if (!session_id) return;

    (async () => {
      const res = await fetch(`/api/save-order?session_id=${session_id}`);
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Could not save order.");
        return;
      }

      setMsg("Order saved! 🎉");
    })();
  }, [router.query.session_id]);

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Payment successful 🎉</h1>
      <p>{msg}</p>
      <Link href="/outfits" style={{ fontWeight: 800 }}>
        Keep shopping →
      </Link>
    </main>
  );
}
