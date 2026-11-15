"use client";

import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLiveCases } from "@/lib/useLiveCases";

export default function DashboardPage() {
  const { user } = useAuth();
  const { reports, matches } = useLiveCases();

  const myReports = user
    ? reports.filter((r) => r.reportedByUid === user.uid)
    : reports;

  const activeCases = myReports.filter(
    (r) => r.status !== "resolved" && r.status !== "cancelled"
  );

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const notifications = myReports.filter((r) => r.status && r.status !== "submitted");

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        {pendingMatches.length > 0 && (
          <Link
            href={`/match-alert?id=${pendingMatches[0].id}`}
            className="flex items-start gap-3 bg-amber-50 border border-[#F0DBA5] rounded-md p-4 mb-8 hover:bg-[#FFF3D9] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#7A5410]">
                {pendingMatches.length} potential match{pendingMatches.length > 1 ? "es" : ""} found
              </div>
              <div className="text-xs text-[#9C7420]">
                {Math.round(pendingMatches[0].confidence || 0)}% AI confidence — Review now
              </div>
            </div>
          </Link>
        )}

        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/report-missing" className="rounded-md bg-brand-100 p-5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center mb-3">📋</div>
            <div className="font-bold text-sm text-navy-900">Report missing</div>
          </Link>
          <Link href="/report-found" className="rounded-md bg-teal-100 p-5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center mb-3">🧭</div>
            <div className="font-bold text-sm text-navy-900">Report found person</div>
          </Link>
        </div>

        <SectionLabel>My active cases</SectionLabel>
        {activeCases.length === 0 ? (
          <Card className="p-5 mb-10 text-center text-xs text-ink-400">
            No active cases filed yet. Use Quick Actions above to submit a report.
          </Card>
        ) : (
          <div className="space-y-3 mb-10">
            {activeCases.map((c) => (
              <Link key={c.id} href={`/case-status?id=${c.id}`} className="block">
                <Card className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-bold text-sm text-navy-900">
                        {c.name}{c.age ? `, ${c.age}` : ""}
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">
                        {c.location || `Brgy. ${c.barangay}, Cebu City`}
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#E8F8F1] text-success rounded-full px-2.5 py-1">
                      ● {c.status || "Active"}
                    </span>
                  </div>
                  <div className="text-xs text-ink-700 mt-3 pt-3 border-t border-dashed border-line">
                    Case {c.caseCode || `#${c.id.slice(0, 6)}`} · Brgy. {c.barangay || "Cebu City"}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <SectionLabel>Notifications</SectionLabel>
        {notifications.length === 0 ? (
          <div className="text-xs text-ink-400 py-3">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {notifications.map((n) => (
              <Link key={n.id} href={`/case-status?id=${n.id}`} className="flex gap-3 py-3 hover:bg-slate-50 px-1 rounded">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm shrink-0">✓</div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">
                    Report for {n.name} is now {n.status}
                  </div>
                  <div className="text-xs text-ink-400">
                    {n.location || `Brgy. ${n.barangay || "Cebu City"}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
