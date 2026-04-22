import type { Outfit } from "./outfits";

export type CartItem = {
  // legacy key (still used by older items)
  id: string;

  // ✅ real DB bundle id when item is a Bundle
  bundleId?: string;

  title: string;
  price: number; // cents
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

// Accept either a static Outfit or a DB Bundle-like item
type Addable =
  | Outfit
  | {
      id: string; // could be bundle id or legacy id
      bundleId?: string; // ✅ real bundle id
      title: string;
      price: number;
      image: string;
      occasion: string;
    };

function keyOf(x: { id: string; bundleId?: string }) {
  // If bundleId exists, use it as stable key (real DB id)
  return x.bundleId || x.id;
}

export function addToBag(item: Addable) {
  const items = readCart();
  const k = keyOf(item);

  const existing = items.find((x) => keyOf(x) === k);

  const next = existing
    ? items.map((x) => (keyOf(x) === k ? { ...x, qty: x.qty + 1 } : x))
    : [
        ...items,
        {
          id: item.id,
          bundleId: (item as any).bundleId || undefined,
          title: item.title,
          price: item.price,
          image: item.image,
          occasion: item.occasion,
          qty: 1,
        },
      ];

  writeCart(next);
}

export function setQty(idOrKey: string, qty: number) {
  const items = readCart();
  const next = items
    .map((x) => (keyOf(x) === idOrKey || x.id === idOrKey ? { ...x, qty } : x))
    .filter((x) => x.qty > 0);
  writeCart(next);
}

export function removeItem(idOrKey: string) {
  const items = readCart();
  writeCart(items.filter((x) => keyOf(x) !== idOrKey && x.id !== idOrKey));
}

export function clearCart() {
  writeCart([]);
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, x) => sum + x.price * x.qty, 0);
  return { subtotal };
}
