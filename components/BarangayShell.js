"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { signOutUser } from "@/lib/auth";

const nav = [
  {
    href: "/barangay/dashboard",
    label: "Dashboard",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/barangay/dashboard?view=reports",
    label: "Reports",
    badge: "5",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/barangay/dashboard?view=cases",
    label: "Cases",
    badge: "12",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/match-alert",
    label: "Alerts",
    badge: "3",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export default function BarangayShell({
  children,
  title = "Barangay Labangon — Dashboard",
  subtitle = "Cebu City LGU · First-Level Report Verification & AI Alert Review",
  activeNav = "Dashboard",
  onSelectNav,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const officialName = user ? profile?.name || user.displayName || "Barangay Official" : "Bgy. Jose Santos";
  const officialEmail = user ? user.email : "jose@labangon.gov";
  const officialInitials = officialName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1967D2] flex items-center justify-center shadow-inner text-white font-extrabold text-sm">
            🏛️
          </div>
          <div>
            <span className="font-head font-extrabold text-white text-base block leading-none tracking-tight">
              TraceNet
            </span>
            <span className="text-[11px] text-[#7A9CC6] font-medium block mt-1">
              Barangay Portal
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white p-1"
        >
          ✕
        </button>
      </div>

      {/* Jurisdiction Badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            Brgy. Labangon Desk Online
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6A88AC]">
          Barangay Operations
        </div>
        {nav.map((item) => {
          const isActive = activeNav
            ? activeNav === item.label
            : pathname === item.href;
          return onSelectNav ? (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onSelectNav(item.label);
                setMobileDrawerOpen(false);
              }}
              className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1967D2] text-white shadow-md shadow-blue-950/40"
                  : "text-[#94AFC9] hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1967D2] text-white shadow-md shadow-blue-950/40"
                  : "text-[#94AFC9] hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6A88AC]">
          Switch Portal View
        </div>
        <Link
          href="/ccpo/dashboard"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#94AFC9] hover:bg-white/8 hover:text-white transition-colors"
        >
          <span>🛡️ CCPO Command</span>
          <span className="text-[10px] opacity-60">→</span>
        </Link>
        <Link
          href="/admin"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#94AFC9] hover:bg-white/8 hover:text-white transition-colors"
        >
          <span>⚙️ Admin Console</span>
          <span className="text-[10px] opacity-60">→</span>
        </Link>
      </nav>

      {/* Official Profile Footer */}
      <div className="p-4 border-t border-white/10 bg-[#081930]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xs font-extrabold text-emerald-300 shrink-0">
            {officialInitials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">{officialName}</div>
            <div className="text-[10px] text-[#7A9CC6] truncate">{officialEmail}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            router.push("/barangay/login");
          }}
          className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>←</span> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#0B2240] text-white shrink-0 select-none shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] flex flex-col bg-[#0B2240] text-white h-full z-10 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
              aria-label="Open Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-head font-extrabold text-base sm:text-lg text-[#0B2240] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/barangay/login"
              className="text-xs font-semibold text-slate-600 hover:text-[#0B2240] bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-lg transition-colors"
              title="Barangay Official Login (Fig 30.1)"
            >
              🔑 Login Screen
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-4 h-14 shadow-lg">
          {nav.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
                  isActive ? "text-[#1967D2]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
