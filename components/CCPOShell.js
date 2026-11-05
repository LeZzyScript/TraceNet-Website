"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { signOutUser } from "@/lib/auth";

const nav = [
  {
    href: "/ccpo/dashboard",
    label: "Dashboard",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/ccpo/cases",
    label: "Cases",
    badge: "48",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/ccpo/heatmap",
    label: "Heatmap",
    badge: "GIS",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    href: "/match-alert",
    label: "Alerts",
    badge: "11",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: "/ccpo/cases?tab=reports",
    label: "Reports",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function CCPOShell({
  children,
  title = "CCPO Command Dashboard",
  subtitle = "Cebu City Police Office · Real-Time Missing Persons Operations",
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const officerName = user ? profile?.name || user.displayName || "CCPO Officer" : "PO2 dela Cruz";
  const officerEmail = user ? user.email : "ccpo@cebu.gov.ph";
  const officerInitials = officerName
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
            🛡️
          </div>
          <div>
            <span className="font-head font-extrabold text-white text-base block leading-none tracking-tight">
              TraceNet
            </span>
            <span className="text-[11px] text-[#7A9CC6] font-medium block mt-1">
              CCPO Portal
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

      {/* System Status Pill */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-300">
            AI &amp; GIS Engine Active
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6A88AC]">
          Command Navigation
        </div>
        {nav.map((item) => {
          const active = pathname === item.href.split("?")[0] && item.label !== "Reports";
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-[#1967D2] text-white shadow-md shadow-blue-950/40"
                  : "text-[#94AFC9] hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
                  }`}
                >
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
          href="/barangay/dashboard"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#94AFC9] hover:bg-white/8 hover:text-white transition-colors"
        >
          <span>🏛️ Barangay Portal</span>
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

      {/* Bottom Officer Profile Card */}
      <div className="p-4 border-t border-white/10 bg-[#081930]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#1967D2]/30 border border-[#1967D2] flex items-center justify-center text-xs font-extrabold text-white shrink-0">
            {officerInitials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">{officerName}</div>
            <div className="text-[10px] text-[#7A9CC6] truncate">{officerEmail}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            router.push("/ccpo/login");
          }}
          className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>←</span> Sign Out of Command
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

      {/* Mobile Slide-Over Sidebar Drawer */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Sticky Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
              aria-label="Open Navigation"
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
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              80/20 AI Pipeline Ready
            </span>
            <Link
              href="/ccpo/login"
              className="text-xs font-semibold text-slate-600 hover:text-[#0B2240] bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-lg transition-colors"
              title="CCPO Login Screen (Fig 23)"
            >
              🔑 Login Screen
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar for Mobile-Web Orientation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-4 h-14 shadow-lg">
          {nav.slice(0, 4).map((item) => {
            const active = pathname === item.href.split("?")[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
                  active ? "text-[#1967D2]" : "text-slate-400 hover:text-slate-700"
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
