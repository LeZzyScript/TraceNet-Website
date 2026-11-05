"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

const navItems = [
  { href: "/dashboard", label: "Citizen App", badge: "Mobile UI" },
  { href: "/barangay/dashboard", label: "Barangay Portal" },
  { href: "/ccpo/dashboard", label: "CCPO Command" },
  { href: "/ccpo/heatmap", label: "GIS Heatmap" },
  { href: "/admin", label: "Admin Console" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="container-page flex items-center justify-between h-16 md:h-[72px]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs ring-1 ring-slate-900/10 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-icon.png"
              alt="TraceNet"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-head font-extrabold text-lg text-[#0B2240] tracking-tight block leading-none">
              TraceNet
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block mt-0.5">
              Cebu City AI Missing Persons
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#0B2240] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0B2240] hover:bg-white/70"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-[#1967D2] font-extrabold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Button href="/sign-in" variant="ghost" className="text-xs px-3.5 py-2">
            Sign in
          </Button>
          <Button href="/report-missing" variant="primary" className="text-xs px-4 py-2">
            + Report Missing
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
            TraceNet Portals
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-[#0B2240] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">→</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/report-missing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-[#1967D2] text-xs font-bold text-white shadow-xs"
            >
              + Report Missing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
