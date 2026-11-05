"use client";

import { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLiveCases } from "@/lib/useLiveCases";

const DEMO_CASES = [
  {
    name: "Maria Santos, 34",
    id: "#2038",
    href: "/case-status",
    resolved: false,
    badge: { label: "● Match", className: "bg-teal-100 text-[#0E8FA3]" },
    note: "87% AI confidence · Awaiting your confirmation",
  },
  {
    name: "Bert Navarro, 44",
    id: "#2035",
    href: "/case-status",
    resolved: true,
    badge: { label: "Resolved", className: "bg-[#EEF0F4] text-ink-500" },
    note: "Reunited with family on July 3",
  },
];

export default function CasesPage() {
  const { user } = useAuth();
  const { live, reports, bestByReport } = useLiveCases();
  const [filter, setFilter] = useState("all");

  const cases = useMemo(() => {
    if (!live || !user) return DEMO_CASES;
    const mine = reports.filter((r) => r.reportedByUid === user.uid);
    if (mine.length === 0) return DEMO_CASES;

    return mine.map((r) => {
      const match = bestByReport.get(r.id);
      const isResolved = r.status === "resolved";
      let badge = { label: "Submitted", className: "bg-amber-100 text-amber-800" };
      let note = `Reported at ${r.location} · Status: ${r.status}`;

      if (isResolved) {
        badge = { label: "Resolved", className: "bg-[#EEF0F4] text-ink-500" };
        note = "Case marked resolved by authorities";
      } else if (match) {
        badge = { label: "● Match", className: "bg-teal-100 text-[#0E8FA3]" };
        note = `${match.confidence}% AI confidence · View case progress`;
      } else if (r.status === "forwarded") {
        badge = { label: "Forwarded to CCPO", className: "bg-blue-100 text-blue-800" };
      } else if (r.status === "verified") {
        badge = { label: "Verified", className: "bg-emerald-100 text-emerald-800" };
      }

      return {
        name: r.age ? `${r.name}, ${r.age}` : r.name,
        id: r.caseCode,
        typeLabel: r.type === "sighting" ? "Sighting" : "Missing",
        href: `/case-status?id=${r.id}`,
        resolved: isResolved,
        badge,
        note,
      };
    });
  }, [live, user, reports, bestByReport]);

  const activeCount = cases.filter((c) => !c.resolved).length;
  const resolvedCount = cases.filter((c) => c.resolved).length;

  const visibleCases = cases.filter((c) => {
    if (filter === "active") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  const tabs = [
    { key: "all", label: `All (${cases.length})` },
    { key: "active", label: `Active (${activeCount})` },
    { key: "resolved", label: `Resolved (${resolvedCount})` },
  ];

  return (
    <DashboardShell>
      <h1 className="font-head font-extrabold text-2xl text-navy-900 mb-1">My cases</h1>
      <p className="text-sm text-ink-500 mb-8">Everything you&rsquo;ve reported</p>

      <div className="flex gap-2 mb-6 max-w-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`flex-1 text-center py-2.5 rounded-md text-xs font-extrabold border transition-colors ${
              filter === t.key
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-paper text-ink-700 border-line hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl space-y-3">
        {visibleCases.map((c) => {
          const card = (
            <Card className={`p-4 ${c.href ? "hover:shadow-lg transition-shadow" : ""}`}>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-bold text-sm text-navy-900">{c.name}</div>
                  <div className="text-xs text-ink-400">
                    Case {c.id} · {c.typeLabel || "Missing"}
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-1 whitespace-nowrap ${c.badge.className}`}>
                  {c.badge.label}
                </span>
              </div>
              <div className="text-xs text-ink-700 mt-3 pt-3 border-t border-dashed border-line">
                {c.note}
              </div>
            </Card>
          );
          return c.href ? (
            <Link key={c.id} href={c.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={c.id}>{card}</div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
