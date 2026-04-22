"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type LayoutProps = {
  children: React.ReactNode;
};

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/outfits", label: "Shop" },
];

const accountLinks = [
  { href: "/orders", label: "My Orders" },
];

const vendorLinks = [
  { href: "/vendors", label: "Vendors" },
  { href: "/sell", label: "Vendor Apply" },
  { href: "/vendor/dashboard", label: "Vendor Dashboard" },
];

const adminLinks = [
  { href: "/admin", label: "Admin" },
];

function NavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`transition-colors duration-200 ${
        active ? "text-black" : "text-neutral-600 hover:text-black"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagCount] = useState(1);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f5f2]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[76px] items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="min-w-0">
              <div className="text-[1.5rem] font-semibold tracking-[-0.05em] text-black">
                OutfitInABag
              </div>

              <div className="hidden text-xs text-neutral-500 sm:block">
                Curated outfit bundles for every occasion
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-8 md:flex">
              {publicLinks.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                />
              ))}

              <Link
                href="/bag"
                className="rounded-full border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Bag ({bagCount})
              </Link>

              <div className="h-6 w-px bg-black/10" />

              {accountLinks.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                />
              ))}

              {vendorLinks.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                />
              ))}

              {adminLinks.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                />
              ))}
            </nav>

            {/* MOBILE NAV */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/outfits"
                className="rounded-full px-3 py-2 text-sm font-medium text-neutral-700"
              >
                Shop
              </Link>

              <Link
                href="/bag"
                className="rounded-full border border-black px-3 py-2 text-sm font-medium"
              >
                Bag ({bagCount})
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white shadow-sm"
                aria-label="Open menu"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="block h-[1.5px] w-5 bg-black" />
                  <span className="block h-[1.5px] w-5 bg-black" />
                  <span className="block h-[1.5px] w-5 bg-black" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <>
          <button
            className="fixed inset-0 z-50 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          <aside className="fixed right-0 top-0 z-[60] flex h-full w-[84%] max-w-[360px] flex-col bg-white p-6 shadow-2xl md:hidden">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold tracking-[-0.03em]">
                  OutfitInABag
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  Curated outfit bundles
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto pb-8">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Shop
                </h3>

                <div className="space-y-4 text-lg">
                  {publicLinks.map((item) => (
                    <div key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        pathname={pathname}
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                  ))}

                  <div>
                    <NavLink
                      href="/bag"
                      label={`Bag (${bagCount})`}
                      pathname={pathname}
                      onClick={() => setMenuOpen(false)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Account
                </h3>

                <div className="space-y-4 text-lg">
                  {accountLinks.map((item) => (
                    <div key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        pathname={pathname}
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Vendor
                </h3>

                <div className="space-y-4 text-lg">
                  {vendorLinks.map((item) => (
                    <div key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        pathname={pathname}
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Admin
                </h3>

                <div className="space-y-4 text-lg">
                  {adminLinks.map((item) => (
                    <div key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        pathname={pathname}
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </>
      )}

      <main>{children}</main>
    </div>
  );
}