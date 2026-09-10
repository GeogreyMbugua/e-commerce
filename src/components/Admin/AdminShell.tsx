"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  adminCategoriesPath,
  adminProductsPath,
  shopPath,
} from "@/lib/routes";

const navItems = [
  { href: adminProductsPath, label: "Products" },
  { href: adminCategoriesPath, label: "Categories" },
];

export default function AdminShell({
  children,
  title,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut, customer } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream/50 text-brand-ink">
      <Toaster position="top-right" />
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-brand-ink/10 bg-white lg:flex">
          <div className="border-b border-brand-ink/10 px-5 py-5">
            <p className="font-semibold tracking-wide text-brand-ink">
              AudioVintage
            </p>
            <p className="mt-0.5 text-xs text-brand-ink/55">Admin</p>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-ink text-white"
                      : "text-brand-ink/80 hover:bg-brand-cream"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-2 border-t border-brand-ink/10 p-4">
            <Link
              href={shopPath}
              className="block text-sm text-brand-teal hover:underline"
            >
              View storefront
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-brand-ink/60 hover:text-brand-rust"
            >
              Sign out
            </button>
            {customer?.email ? (
              <p className="truncate text-xs text-brand-ink/45">
                {customer.email}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-brand-ink/10 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-md border border-brand-ink/15 px-2.5 py-1.5 text-sm lg:hidden"
                  onClick={() => setMobileNavOpen((open) => !open)}
                  aria-expanded={mobileNavOpen}
                >
                  Menu
                </button>
                <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
              </div>
              {actions ? (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              ) : null}
            </div>
            {mobileNavOpen ? (
              <nav className="flex flex-col gap-1 border-t border-brand-ink/10 px-3 py-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-brand-cream"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={shopPath}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-brand-teal"
                >
                  View storefront
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    signOut();
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm text-brand-ink/60"
                >
                  Sign out
                </button>
              </nav>
            ) : null}
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
