"use client";

import { addToBag } from "../../../lib/cart";
import type { Outfit } from "../../../lib/outfits";

export default function AddToBagButton({ outfit }: { outfit: Outfit }) {
  return (
    <button
      onClick={() => {
        addToBag(outfit);
        alert("Added to bag!");
      }}
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: "none",
        background: "#111",
        color: "white",
        fontWeight: 950,
        cursor: "pointer",
      }}
    >
      Add to Bag
    </button>
  );
}
