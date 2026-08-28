import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const notifications = [
  { icon: "✓", title: "Report verified by Brgy. Labangon", time: "2 hours ago" },
  { icon: "📨", title: "Case #2038 forwarded for AI matching", time: "Yesterday" },
  { icon: "🎉", title: "Bert Navarro case resolved", time: "July 3" },
];

export default function AlertsPage() {
  return (
    <DashboardShell>
      <h1 className="font-head font-extrabold text-2xl text-navy-900 mb-1">Alerts</h1>
      <p className="text-sm text-ink-500 mb-6">Matches &amp; case updates</p>

      <Link
        href="/match-alert"
        className="flex items-start gap-3 bg-amber-50 border border-[#F0DBA5] rounded-md p-4 mb-2 max-w-xl hover:bg-[#FFF3D9] transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
        <div>
          <div className="text-sm font-bold text-[#7A5410]">New AI match — 87% confidence</div>
          <div className="text-xs text-[#9C7420]">Case #2038 · Tap to review</div>
        </div>
      </Link>
      <p className="text-xs text-ink-400 leading-relaxed max-w-xl mb-6">
        AI matching runs citywide, not just your own barangay — you may get
        alerts on cases from other barangays too, though nearby matches
        surface first.
      </p>

      <div className="max-w-xl divide-y divide-line">
        {notifications.map((n) => (
          <div key={n.title} className="flex gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm shrink-0">
              {n.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-navy-900">{n.title}</div>
              <div className="text-xs text-ink-400">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
