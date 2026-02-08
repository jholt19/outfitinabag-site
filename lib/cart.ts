import type { Outfit } from "./outfits";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  occasion: string;
  qty: number;
};

export const CART_KEY = "oia_cart_v1";

function safeParse(raw: string | null) {
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(CART_KEY));
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("storage"));
}

export function addToBag(outfit: Outfit) {
  const items = readCart();
  const existing = items.find((x) => x.id === outfit.id);

  const next = existing
    ? items.map((x) => (x.id === outfit.id ? { ...x, qty: x.qty + 1 } : x))
    : [
        ...items,
        {
          id: outfit.id,
          title: outfit.title,
          price: outfit.price,
          image: outfit.image,
          occasion: outfit.occasion,
          qty: 1,
        },
      ];

  writeCart(next);
}

export function setQty(id: string, qty: number) {
  const items = readCart();
  const next = items
    .map((x) => (x.id === id ? { ...x, qty } : x))
    .filter((x) => x.qty > 0);
  writeCart(next);
}

export function removeItem(id: string) {
  const items = readCart();
  writeCart(items.filter((x) => x.id !== id));
}

export function clearCart() {
  writeCart([]);
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, x) => sum + x.price * x.qty, 0);
  return { subtotal };
}
