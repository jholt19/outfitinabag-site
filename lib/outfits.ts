// lib/outfits.ts

export type Occasion = "VACATION" | "FORMAL" | "CASUAL" | "WEDDING";

export type Outfit = {
  id: string;
  title: string;
  occasion: Occasion;
  description: string;
  price: number; // cents
  image: string; // path in /public
};

export const OUTFITS: Outfit[] = [
  // ✅ FORMAL (THIS IS WHY YOUR FORMAL BUTTON LOOKS EMPTY)
  {
    id: "for-1",
    title: "Formal Night Out",
    occasion: "FORMAL",
    description: "Sharp formal look for dinners, events, and date night.",
    price: 22900,
    image: "/outfits/for-1.jpg",
  },
  {
    id: "for-2",
    title: "Black Tie Ready",
    occasion: "FORMAL",
    description: "Classic elevated fit that works for upscale occasions.",
    price: 25900,
    image: "/outfits/for-2.jpg",
  },

  // WEDDING
  {
    id: "wed-1",
    title: "Wedding Guest Classic",
    occasion: "WEDDING",
    description: "Dressy look for weddings.",
    price: 19900,
    image: "/outfits/wed-1.jpg",
  },

  // CASUAL
  {
    id: "cas-1",
    title: "Everyday Clean Fit",
    occasion: "CASUAL",
    description: "Easy everyday outfit that still looks put together.",
    price: 14900,
    image: "/outfits/cas-1.jpg",
  },

  // VACATION
  {
    id: "vac-1",
    title: "Resort Night Look",
    occasion: "VACATION",
    description: "Vacation dinner look — clean, breathable, and sharp.",
    price: 17900,
    image: "/outfits/vac-1.jpg",
  },
];
export function getOutfit(id: string) {
  return OUTFITS.find((o) => o.id === id) ?? null;
}
