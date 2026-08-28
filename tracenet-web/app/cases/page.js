import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const cases = [
  {
    name: "Maria Santos, 34",
    id: "#2038",
    href: "/case-status",
    badge: { label: "● Match", className: "bg-teal-100 text-[#0E8FA3]" },
    note: "87% AI confidence · Awaiting your confirmation",
  },
  {
    name: "Bert Navarro, 44",
    id: "#2035",
    href: null,
    badge: { label: "Resolved", className: "bg-[#EEF0F4] text-ink-500" },
    note: "Reunited with family on July 3",
  },
];

export default function CasesPage() {
  return (
    <DashboardShell>
      <h1 className="font-head font-extrabold text-2xl text-navy-900 mb-1">My cases</h1>
      <p className="text-sm text-ink-500 mb-8">Everything you&rsquo;ve reported</p>

      <div className="flex gap-2 mb-6 max-w-xl">
        {["All (2)", "Active (1)", "Resolved (1)"].map((label, i) => (
          <button
            key={label}
            className={`flex-1 text-center py-2.5 rounded-md text-xs font-extrabold border ${
              i === 0
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-paper text-ink-700 border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-xl space-y-3">
        {cases.map((c) => {
          const card = (
            <Card className={`p-4 ${c.href ? "hover:shadow-lg transition-shadow" : ""}`}>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-bold text-sm text-navy-900">{c.name}</div>
                  <div className="text-xs text-ink-400">Case {c.id} · Missing</div>
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
