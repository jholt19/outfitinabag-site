export type Occasion = "VACATION" | "FORMAL" | "CASUAL" | "WEDDING";

export type Outfit = {
  id: string;
  title: string;
  occasion: Occasion;
  price: number; // cents
  description: string;
  image: string; // path from /public
};

export const OUTFITS: Outfit[] = [
  {
    id: "vac-1",
    title: "Beach Breeze Set",
    occasion: "VACATION",
    price: 14900,
    description: "Lightweight vacation outfit perfect for warm weather and travel.",
    image: "/outfits/vac-1.jpg",
  },
  {
    id: "vac-2",
    title: "Resort Night Look",
    occasion: "VACATION",
    price: 17900,
    description: "Clean night-out look for resort dinners and events.",
    image: "/outfits/vac-2.jpg",
  },
  {
    id: "for-1",
    title: "Black Tie Classic",
    occasion: "FORMAL",
    price: 24900,
    description: "Modern formal outfit with timeless appeal.",
    image: "/outfits/for-1.jpg",
  },
  {
    id: "for-2",
    title: "Gala Evening Fit",
    occasion: "FORMAL",
    price: 21900,
    description: "Sleek formalwear for upscale occasions.",
    image: "/outfits/for-2.jpg",
  },
  {
    id: "cas-1",
    title: "Everyday Clean Fit",
    occasion: "CASUAL",
    price: 9900,
    description: "Simple everyday outfit that always works.",
    image: "/outfits/cas-1.jpg",
  },
  {
    id: "cas-2",
    title: "Weekend Street Set",
    occasion: "CASUAL",
    price: 11900,
    description: "Relaxed but polished weekend look.",
    image: "/outfits/cas-2.jpg",
  },
  {
    id: "wed-1",
    title: "Wedding Guest Classic",
    occasion: "WEDDING",
    price: 19900,
    description: "Perfect guest outfit for most weddings.",
    image: "/outfits/wed-1.jpg",
  },
  {
    id: "wed-2",
    title: "Garden Wedding Fit",
    occasion: "WEDDING",
    price: 18900,
    description: "Light and elegant look for outdoor weddings.",
    image: "/outfits/wed-2.jpg",
  },
];

export function getOutfit(id: string) {
  return OUTFITS.find((o) => o.id === id) || null;
}
