"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CCPOShell from "@/components/CCPOShell";
import DataModeBanner from "@/components/DataModeBanner";
import { useLiveCases } from "@/lib/useLiveCases";
import { ccpoMetrics, toCcpoRow } from "@/lib/reportMapper";

// Demo KPI cards: the exact figures from manuscript Figure 24 (p. 87).
const demoStats = [
  {
    label: "Active Cases",
    value: "48",
    valueColor: "text-rose-600",
    delta: "▲ 4 from yesterday",
    deltaPill: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-50 text-rose-600",
    icon: "🚨",
  },
  {
    label: "AI Matches Pending",
    value: "11",
    valueColor: "text-amber-600",
    delta: "▲ 3 new today",
    deltaPill: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50 text-amber-600",
    icon: "🤖",
  },
  {
    label: "Escalated Cases",
    value: "3",
    valueColor: "text-rose-600",
    delta: "▲ 1 new today",
    deltaPill: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-50 text-rose-600",
    icon: "⚡",
  },
  {
    label: "Resolved This Week",
    value: "7",
    valueColor: "text-emerald-600",
    delta: "▲ 2 vs last week",
    deltaPill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: "✅",
  },
];

const demoLiveCases = [
  {
    id: "#2038",
    initials: "MS",
    name: "Maria Santos, 34",
    subtext: "Reported 3 hrs ago · Female",
    barangay: "Labangon",
    status: "● Match",
    statusBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    score: "87%",
    scoreNum: 87,
    href: "/match-alert",
  },
  {
    id: "#2041",
    initials: "PR",
    name: "Pedro Reyes, 72",
    subtext: "Unresolved 48 hrs · Elderly Male",
    barangay: "Guadalupe",
    status: "Escalated",
    statusBadge: "bg-rose-50 text-rose-700 border border-rose-200",
    score: "—",
    scoreNum: 0,
    href: "/ccpo/cases",
  },
  {
    id: "#2042",
    initials: "LT",
    name: "Liza Tan, 16",
    subtext: "Reported 1 hr ago · Minor Female",
    barangay: "Mabolo",
    status: "New",
    statusBadge: "bg-amber-50 text-amber-700 border border-amber-200",
    score: "Pending",
    scoreNum: 0,
    href: "/ccpo/cases",
  },
];

const initialCoordination = [
  {
    id: 1,
    text: "Alert dispatched to Brgy. Mabolo — Case #2038 pending confirmation",
    time: "14 mins ago",
    badge: "Sent",
    badgeClass: "bg-blue-50 text-[#1967D2] border border-blue-200",
  },
  {
    id: 2,
    text: "Case #2041 escalated — District 3 Station",
    time: "1 hr ago",
    badge: "ACK",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
];

export default function CCPODashboardPage() {
  const {
    configured,
    authLoading,
    live,
    loading,
    error,
    reports: liveReports,
    matchByReport,
  } = useLiveCases(["ccpo_officer", "admin"]);

  const [coordination, setCoordination] = useState(initialCoordination);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [targetBrgy, setTargetBrgy] = useState("Brgy. Guadalupe");
  const [caseRef, setCaseRef] = useState("Case #2041");
  const [alertMessage, setAlertMessage] = useState(
    "Deploy patrol unit and coordinate with barangay tanods for immediate search."
  );

  const liveRows = useMemo(
    () => liveReports.map((r) => toCcpoRow(r, matchByReport.get(r.id))),
    [liveReports, matchByReport]
  );

  // KPI cards: computed from real data in live mode. Deltas ("from yesterday")
  // need historical snapshots we don't store yet, so live mode shows a plain
  // descriptor instead of an invented trend.
  const stats = useMemo(() => {
    if (!live) return demoStats;
    const m = ccpoMetrics(liveRows);
    const card = (label, value, valueColor, delta, icon, iconBg) => ({
      label,
      value: String(value),
      valueColor,
      delta,
      deltaPill: "bg-slate-50 text-slate-500 border-slate-200",
      icon,
      iconBg,
    });
    return [
      card("Active Cases", m.active, "text-rose-600", "Open missing person cases", "🚨", "bg-rose-50 text-rose-600"),
      card("AI Matches Pending", m.aiMatchesPending, "text-amber-600", "Awaiting review", "🤖", "bg-amber-50 text-amber-600"),
      card("Escalated Cases", m.escalated, "text-rose-600", "Forwarded to CCPO", "⚡", "bg-rose-50 text-rose-600"),
      card("Resolved", m.resolved, "text-emerald-600", "All time", "✅", "bg-emerald-50 text-emerald-600"),
    ];
  }, [live, liveRows]);

  const liveCases = live ? liveRows.slice(0, 5) : demoLiveCases;

  // Real escalation rule: oldest unresolved report open for 48+ hours.
  const overdue = useMemo(() => {
    if (!live) return null;
    const cutoff = Date.now() - 48 * 3600 * 1000;
    const stale = liveReports
      .filter((r) => r.status !== "resolved" && r.createdAt && r.createdAt.getTime() < cutoff)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!stale) return null;
    return {
      id: stale.shortId,
      name: stale.age != null ? `${stale.name}, ${stale.age}` : stale.name,
      barangay: stale.barangay,
      hours: Math.floor((Date.now() - stale.createdAt.getTime()) / 3600000),
    };
  }, [live, liveReports]);

  function handleDispatchAlert(e) {
    e.preventDefault();
    setCoordination((prev) => [
      {
        id: Date.now(),
        text: `Alert dispatched to ${targetBrgy} — ${caseRef}: ${alertMessage}`,
        time: "Just now",
        badge: "Sent",
        badgeClass: "bg-blue-50 text-[#1967D2] border border-blue-200",
      },
      ...prev,
    ]);
    setShowDispatchModal(false);
  }

  return (
    <CCPOShell title="CCPO Command Dashboard">
      <DataModeBanner
        live={live}
        loading={loading}
        error={error}
        configured={configured}
        authLoading={authLoading}
        loginHref="/ccpo/login"
      />
      {/* 4 KPI Metric Cards (Figure 24 p. 87 — Modern SaaS Card Polish) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">
                {s.label}
              </span>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${s.iconBg}`}>
                {s.icon}
              </span>
            </div>
            <div className={`text-3xl font-head font-extrabold tracking-tight mb-2.5 ${s.valueColor}`}>
              {s.value}
            </div>
            <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.deltaPill}`}>
              {s.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Escalation Alert Banner (Figure 24 p. 87). Live mode: real 48-hour rule. */}
      {(!live || overdue) && (
      <div className="bg-gradient-to-r from-rose-50 via-red-50/80 to-white border border-rose-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm shrink-0 shadow-xs">
            🚨
          </span>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-rose-900">
              {live
                ? `Escalation — Case ${overdue.id} (${overdue.name}) unresolved ${overdue.hours} hrs. ${
                    overdue.barangay === "Unassigned" ? "Barangay unassigned." : `Brgy. ${overdue.barangay}.`
                  } Action required.`
                : "Escalation — Case #2041 (Pedro Reyes, 72) unresolved 48 hrs. Brgy. Guadalupe. Action required."}
            </div>
            <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">
              {live
                ? "48-hour threshold exceeded for an unresolved case"
                : "Automatic 48-hour SLA threshold triggered · Assigned to CCPO District 3 Station"}
            </div>
          </div>
        </div>
        <Link
          href="/ccpo/cases"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          Review Case →
        </Link>
      </div>
      )}

      {/* Live Case Feed Card (Figure 24 p. 87) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B2240]">Live Case Feed</h2>
            <p className="text-[11px] text-slate-400">
              Real-time missing person reports &amp; 80/20 AI similarity scores across Cebu City
            </p>
          </div>
          <Link
            href="/ccpo/cases"
            className="text-xs font-bold text-[#1967D2] hover:text-[#1454B0] inline-flex items-center gap-1"
          >
            View All {live ? liveRows.length : 48} Cases →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-5">Name / Age</th>
                <th className="py-3.5 px-5">Barangay</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Match Score (80/20)</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveCases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-5 text-center text-sm text-slate-500">
                    {loading
                      ? "Loading live reports…"
                      : "No cases yet. Reports from the mobile app and website will appear here instantly."}
                  </td>
                </tr>
              )}
              {liveCases.map((c) => (
                <tr key={c.docId || c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-[#0B2240] shrink-0">
                        {c.initials}
                      </div>
                      <div>
                        <Link
                          href={c.href || "/ccpo/cases"}
                          className="font-bold text-slate-900 hover:text-[#1967D2] block"
                        >
                          {c.name}{" "}
                          <span className="text-slate-400 font-normal text-[11px]">({c.id})</span>
                        </Link>
                        <span className="text-[11px] text-slate-400">{c.subtext}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-600">
                    📍 Brgy. {c.barangay}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${c.statusBadge}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {c.scoreNum > 0 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#1967D2] rounded-full"
                            style={{ width: `${c.scoreNum}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#1967D2] text-xs">{c.score}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">{c.score}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={c.href || "/ccpo/cases"}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1967D2] text-slate-700 hover:text-white font-bold text-xs transition-colors"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Barangay Coordination Panel (Figure 24 p. 87) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B2240]">
              Cross-Barangay Coordination
            </h2>
            <p className="text-[11px] text-slate-400">
              Inter-agency dispatches and Barangay Hall acknowledgments
            </p>
          </div>
          <button
            type="button"
            disabled={live}
            title={live ? "Inter-agency dispatch is not connected to live data yet" : undefined}
            onClick={() => setShowDispatchModal(true)}
            className="bg-[#1967D2] hover:bg-[#1454B0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔔</span> + Dispatch Alert
          </button>
        </div>

        {live && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-dashed border-slate-300 text-xs text-slate-500">
            Inter-agency dispatch is not connected to live data yet. It needs a shared
            Firestore collection agreed with the mobile team, so no sample dispatches are
            shown here.
          </div>
        )}

        <div className="space-y-2.5">
          {!live && coordination.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3 text-slate-700">
                <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  📡
                </span>
                <div>
                  <div className="font-semibold text-slate-800">{item.text}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.time}</div>
                </div>
              </div>
              <span className={`self-start sm:self-center text-[11px] font-bold px-3 py-1 rounded-full shrink-0 ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Inter-Agency Alert Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-head font-extrabold text-base text-[#0B2240] mb-1">
              Dispatch Cross-Barangay Alert
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send an immediate coordination bulletin to Cebu City barangays and police stations.
            </p>
            <form onSubmit={handleDispatchAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Recipient Barangay / Station
                </label>
                <input
                  value={targetBrgy}
                  onChange={(e) => setTargetBrgy(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Case Reference</label>
                <input
                  value={caseRef}
                  onChange={(e) => setCaseRef(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alert Directive</label>
                <textarea
                  rows={3}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1967D2]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#1967D2] hover:bg-[#1454B0] text-white font-bold shadow-xs"
                >
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CCPOShell>
  );
}
