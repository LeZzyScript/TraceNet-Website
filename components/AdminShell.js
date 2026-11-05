"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { signOutUser } from "@/lib/auth";

const nav = [
  {
    id: "dashboard",
    label: "Dashboard",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Users",
    badge: "1,247",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "approvals",
    label: "Account Approvals",
    badge: "8",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings & Analytics",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "My Profile",
    badge: null,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AdminShell({
  children,
  title = "Admin Panel — User Management",
  subtitle = "Platform Governance, Role-Based Access Control & RA 10173 Audit Compliance",
  activeTab = "users",
  onSelectTab,
}) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const adminName = user ? profile?.name || user.displayName || "Administrator" : "Adm. Rosa Flores";
  const adminEmail = user ? user.email : "rosa@admin.gov";
  const adminInitials = adminName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1967D2] flex items-center justify-center shadow-inner text-white font-extrabold text-sm">
            ⚙️
          </div>
          <div>
            <span className="font-head font-extrabold text-white text-base block leading-none tracking-tight">
              TraceNet
            </span>
            <span className="text-[11px] text-[#7A9CC6] font-medium block mt-1">
              Admin Panel
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

      {/* Compliance Status */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            RA 10173 Audit Logging On
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6A88AC]">
          System Administration
        </div>
        {nav.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab(item.id);
                setMobileDrawerOpen(false);
              }}
              className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {item.badge}
                </span>
              )}
            </button>
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
          href="/barangay/dashboard"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#94AFC9] hover:bg-white/8 hover:text-white transition-colors"
        >
          <span>🏛️ Barangay Portal</span>
          <span className="text-[10px] opacity-60">→</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#081930]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xs font-extrabold text-amber-300 shrink-0">
            {adminInitials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-white truncate">{adminName}</div>
            <div className="text-[10px] text-[#7A9CC6] truncate">{adminEmail}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            router.push("/admin/login");
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
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-slate-600 hover:text-[#0B2240] bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-lg transition-colors"
              title="Admin Login Screen (Fig 33.1)"
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
          {nav.slice(0, 4).map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${
                  active ? "text-[#1967D2]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {item.icon}
                <span className="truncate max-w-[70px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
