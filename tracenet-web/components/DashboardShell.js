"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/cases", label: "My Cases", icon: "🗂" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-paper">
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
        <div className="px-6 py-5 border-t border-white/10 text-xs text-white/40">
          Juan dela Cruz<br />Brgy. Labangon
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] flex items-center justify-between px-6 md:px-10 border-b border-line bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5 md:hidden">
            <Image src="/logo-icon.png" alt="TraceNet" width={28} height={28} className="rounded-[8px]" />
            <span className="font-head font-extrabold text-navy-900">TraceNet</span>
          </div>
          <div className="hidden md:block font-head font-bold text-navy-900">
            Welcome back, Juan
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm">
            👤
          </div>
        </header>
        <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
