"use client";

import Link from "next/link";
import Image from "@/components/Common/BrandedImage";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  adminCategoriesPath,
  adminProductsPath,
  shopPath,
} from "@/lib/routes";

const navItems = [
  { href: adminProductsPath, label: "Products", hint: "Catalogue & media" },
  { href: adminCategoriesPath, label: "Categories", hint: "Shop filters" },
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
  const { signOut, customer, profileError, refreshProfile } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f3efe6] text-brand-ink">
      <Toaster position="top-right" />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(184,95,45,0.14), transparent 55%), radial-gradient(ellipse 55% 40% at 100% 10%, rgba(45,90,90,0.1), transparent 50%), linear-gradient(180deg, rgba(255,255,255,0.35), transparent 28%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      <div className="relative flex min-h-screen">
        <aside
          className={`hidden w-60 shrink-0 flex-col border-r border-brand-ink/10 bg-white/75 backdrop-blur-md transition-transform duration-500 lg:flex ${
            entered ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
          }`}
        >
          <div className="border-b border-brand-ink/10 px-5 py-6">
            <Link href={adminProductsPath} className="group inline-flex items-center gap-3">
              <Image
                src="/images/logo/vintage-one.png"
                alt="AudioVintage"
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span>
                <span className="block font-semibold tracking-wide text-brand-ink">
                  AudioVintage
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-rust">
                  Catalogue desk
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item, index) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2.5 transition-all duration-300 ${
                    active
                      ? "bg-brand-ink text-white shadow-sm"
                      : "text-brand-ink/80 hover:bg-brand-cream/80 hover:translate-x-0.5"
                  }`}
                  style={{ transitionDelay: entered ? `${index * 40}ms` : "0ms" }}
                >
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span
                    className={`block text-[11px] ${
                      active ? "text-white/65" : "text-brand-ink/45"
                    }`}
                  >
                    {item.hint}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-brand-ink/10 p-4">
            <Link
              href={shopPath}
              className="block text-sm text-brand-teal transition-colors hover:text-brand-ink"
            >
              View storefront
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-brand-ink/55 transition-colors hover:text-brand-rust"
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
          <header className="sticky top-0 z-20 border-b border-brand-ink/10 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="rounded-md border border-brand-ink/15 bg-white px-2.5 py-1.5 text-sm transition hover:border-brand-rust/40 lg:hidden"
                  onClick={() => setMobileNavOpen((open) => !open)}
                  aria-expanded={mobileNavOpen}
                >
                  Menu
                </button>
                <div
                  className={`min-w-0 transition-all duration-500 ${
                    entered
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-rust/90">
                    Admin
                  </p>
                  <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                    {title}
                  </h1>
                </div>
              </div>
              {actions ? (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              ) : null}
            </div>

            {profileError ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 bg-amber-50/90 px-4 py-2 text-xs text-amber-950 sm:px-6">
                <p>
                  Session refresh needed after idle. Some saves may fail until
                  reconnect completes.
                </p>
                <button
                  type="button"
                  onClick={() => void refreshProfile()}
                  className="font-medium underline underline-offset-2"
                >
                  Refresh session
                </button>
              </div>
            ) : null}

            {mobileNavOpen ? (
              <nav className="flex flex-col gap-1 border-t border-brand-ink/10 bg-white px-3 py-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-brand-cream"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={shopPath}
                  className="rounded-md px-3 py-2 text-sm text-brand-teal"
                >
                  View storefront
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-md px-3 py-2 text-left text-sm text-brand-ink/60"
                >
                  Sign out
                </button>
              </nav>
            ) : null}
          </header>

          <main
            className={`flex-1 px-4 py-5 transition-all duration-500 sm:px-6 sm:py-7 ${
              entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
