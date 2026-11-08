"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { signOutUser } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/cases", label: "My Cases", icon: "🗂" },
  { href: "/map", label: "Sightings Map", icon: "🗺️" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = profile?.name || user?.displayName || "Juan dela Cruz";
  const firstName = displayName.split(" ")[0] || "Juan";

  async function handleLogout() {
    try {
      await signOutUser();
    } catch {
      // Ignore if in demo mode
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tracenet_demo_account");
    }
    router.push("/");
  }

  return (
    <div className="min-h-screen flex bg-paper pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-navy-950 text-white/80 shrink-0">
        <div className="flex items-center gap-2.5 px-6 h-[72px] border-b border-white/10">
          <Image src="/logo-icon.png" alt="TraceNet" width={30} height={30} className="rounded-[8px]" />
          <span className="font-head font-extrabold text-white text-base">TraceNet</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "hover:bg-white/5 text-white/75"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-white/10">
          <div className="text-xs text-white/40 mb-3">
            {displayName}
            <br />
            Brgy. Labangon
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span>↩</span> Log out
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-navy-950 text-white flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Image src="/logo-icon.png" alt="TraceNet" width={28} height={28} className="rounded-[8px]" />
                <span className="font-head font-extrabold text-white text-base">TraceNet</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-md bg-white/10 text-white text-sm"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold ${
                      active ? "bg-brand-600 text-white" : "text-white/75 hover:bg-white/5"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-5 py-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-white/70 hover:text-white"
              >
                ↩ Log out ({firstName})
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] px-5 md:px-10 border-b border-line bg-white sticky top-0 z-10 flex items-center">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 md:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 rounded-md border border-line flex items-center justify-center text-navy-900 font-bold"
                aria-label="Open menu"
              >
                ☰
              </button>
              <Image src="/logo-icon.png" alt="TraceNet" width={28} height={28} className="rounded-[8px]" />
              <span className="font-head font-extrabold text-navy-900">TraceNet</span>
            </div>
            <div className="hidden md:block font-head font-bold text-navy-900">
              Welcome back, {firstName}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex text-xs font-semibold text-ink-500 hover:text-ink-900 cursor-pointer"
              >
                Log out
              </button>
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm hover:ring-2 hover:ring-brand-600/30 transition-all"
                title="My Profile"
              >
                👤
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8">
          <div className="w-full max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-white border-t border-line flex items-center justify-around z-30">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center text-[10px] font-bold py-1 px-2 ${
                active ? "text-brand-600" : "text-ink-400"
              }`}
            >
              <span className="text-base leading-none mb-0.5">{item.icon}</span>
              <span>{item.label.replace("Sightings ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
