"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BarangayShell from "@/components/BarangayShell";
import DataModeBanner from "@/components/DataModeBanner";
import { useLiveCases } from "@/lib/useLiveCases";
import {
  approveReport,
  flagReport,
  forwardReport,
  reviewMatch,
  runAiScanAndPersistMatches,
} from "@/lib/liveData";
import { barangayMetrics, toBarangayRow } from "@/lib/reportMapper";

// Demo dataset: the exact rows from Figure 27 (p. 90) & Figure 30 (p. 93) of the
// manuscript. Only used when nobody is signed in with an official account.
const demoReports = [
  {
    id: "#2041",
    caseDisplayId: "#2042",
    initials: "LT",
    name: "Liza Tan, 16",
    personName: "Liza Tan",
    ageGender: "16 · Female",
    submitted: "1 hr ago",
    status: "New",
    score: "Pend.",
    scoreNum: 0,
    lastSeen: "Brgy. Lahug, June 28, 10:30 AM",
    reporter: "Maria Santos · 0917-XXX-XXXX",
    description: '"Last seen wearing school uniform near JY Square Mall..."',
    barangay: "Brgy. Labangon",
  },
  {
    id: "#2038",
    caseDisplayId: "#2038",
    initials: "MS",
    name: "Maria Santos, 34",
    personName: "Maria Santos",
    ageGender: "34 · Female",
    submitted: "3 hrs ago",
    status: "Match",
    score: "87%",
    scoreNum: 87,
    facialScore: 89,
    textScore: 79,
    lastSeen: "Brgy. Labangon, June 28, 8:15 AM",
    reporter: "Juan dela Cruz · 0917-123-4567",
    description: '"Last seen wearing white blouse and blue jeans near Labangon Market..."',
    barangay: "Brgy. Labangon",
  },
  {
    id: "#2037",
    caseDisplayId: "#2037",
    initials: "PR",
    name: "Pedro Reyes, 72",
    personName: "Pedro Reyes",
    ageGender: "72 · Male",
    submitted: "2 days ago",
    status: "Escalated",
    score: "—",
    scoreNum: 0,
    lastSeen: "Brgy. Guadalupe / Labangon boundary, June 26",
    reporter: "Carla Reyes · 0919-444-2233",
    description: '"Elderly male with memory loss, wearing grey shirt and brown shorts..."',
    barangay: "Brgy. Labangon",
  },
  {
    id: "#2036",
    caseDisplayId: "#2036",
    initials: "AC",
    name: "Ana Cruz, 28",
    personName: "Ana Cruz",
    ageGender: "28 · Female",
    submitted: "Yesterday",
    status: "Verified",
    score: "—",
    scoreNum: 0,
    lastSeen: "Salvador St., Brgy. Labangon",
    reporter: "Mark Cruz · 0922-333-8899",
    description: '"Wearing floral dress and red sandals..."',
    barangay: "Brgy. Labangon",
  },
  {
    id: "#2035",
    caseDisplayId: "#2035",
    initials: "BN",
    name: "Bert Navarro, 44",
    personName: "Bert Navarro",
    ageGender: "44 · Male",
    submitted: "June 27",
    status: "Verified",
    score: "74%",
    scoreNum: 74,
    facialScore: 76,
    textScore: 66,
    lastSeen: "Tres de Abril St., Brgy. Labangon",
    reporter: "Dennis Navarro · 0918-999-0011",
    description: '"Wearing striped polo shirt and khaki shorts..."',
    barangay: "Brgy. Labangon",
  },
];

const DEMO_METRICS = { active: 12, aiMatches: 3, pendingVerify: 5, escalated: 2 };

function Avatar({ photoUrl, initials, className }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className={`${className} object-cover`} />;
  }
  return <div className={className}>{initials}</div>;
}

export default function BarangayDashboardPage() {
  const {
    configured,
    authLoading,
    live,
    loading,
    error,
    user,
    reports: liveReports,
    allReports,
    matchByReport,
    matches,
  } = useLiveCases(["barangay_official", "admin"]);

  const [tab, setTab] = useState("New Reports");
  const [demoRows, setDemoRows] = useState(demoReports);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const actor = user
    ? { uid: user.uid, name: user.displayName || user.email }
    : null;

  const rows = useMemo(
    () =>
      live
        ? liveReports.map((r) => toBarangayRow(r, matchByReport.get(r.id)))
        : demoRows,
    [live, liveReports, matchByReport, demoRows]
  );

  const metrics = live ? barangayMetrics(rows) : DEMO_METRICS;
  const aiAlertCount = live ? metrics.aiMatches : 3;

  const selectedReport =
    rows.find((r) => r.id === selectedId) ||
    rows.find((r) => r.status === "New") ||
    rows[0] ||
    null;
  const firstMatchRow = rows.find((r) => r.status === "Match") || rows[0] || null;

  // Counterpart sighting for the Confirm AI Match screen (live mode only).
  const selectedMatch =
    live && selectedReport?.matchId
      ? matches.find((m) => m.id === selectedReport.matchId) || null
      : null;
  const sighting = selectedMatch
    ? allReports.find((r) => r.id === selectedMatch.sightingReportId) || null
    : null;

  function showNotification(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  // Runs a live write; the Firestore listener then refreshes the table, so no
  // local state is mutated in live mode. Demo mode mutates local rows instead.
  async function runAction(liveFn, demoFn, successMsg) {
    if (busy) return;
    setBusy(true);
    try {
      if (live) await liveFn();
      else demoFn();
      setActiveView("dashboard");
      showNotification(successMsg);
    } catch (e) {
      showNotification(
        e?.code === "permission-denied"
          ? "Action blocked: Firestore denied the write for this account."
          : "Action failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function patchDemo(id, patch) {
    setDemoRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleOpenAction(r) {
    setSelectedId(r.id);
    setActiveView(r.status === "Match" ? "confirm-match" : "verify");
  }

  function handleApproveReport(r) {
    runAction(
      () => approveReport(r.docId, actor),
      () => patchDemo(r.id, { status: "Verified", score: "82%", scoreNum: 82 }),
      `Report ${r.id} approved and verified. AI matching can now run.`
    );
  }

  function handleFlagReport(r) {
    runAction(
      () => flagReport(r.docId, "Flagged as duplicate / incomplete", actor),
      () => patchDemo(r.id, { status: "Flagged" }),
      `Report ${r.id} flagged as duplicate / incomplete.`
    );
  }

  function handleForwardToCCPO(r) {
    runAction(
      () => forwardReport(r.docId, actor),
      () => patchDemo(r.id, { status: "Escalated" }),
      `Report ${r.id} forwarded to CCPO Command.`
    );
  }

  function handleConfirmMatch(r) {
    runAction(
      () => reviewMatch(r.matchId, "confirmed", actor),
      () => patchDemo(r.id, { status: "Verified" }),
      `AI match confirmed for ${r.id}. Reporter and CCPO can now see it.`
    );
  }

  function handleDismissMatch(r) {
    if (!live || !r.matchId) {
      setActiveView("dashboard");
      return;
    }
    runAction(
      () => reviewMatch(r.matchId, "needs_review", actor),
      () => {},
      `Match for ${r.id} sent back for manual review.`
    );
  }

  const displayedReports = rows.filter((r) => {
    if (tab === "New Reports") return true;
    if (tab.startsWith("AI Alerts")) return r.status === "Match" || r.scoreNum > 0;
    if (tab === "Verified") return r.status === "Verified" || r.status === "Resolved";
    return true;
  });

  const viewTitle =
    activeView === "verify" && selectedReport
      ? `Verify Report — Case ${selectedReport.caseDisplayId || selectedReport.id}`
      : activeView === "confirm-match"
      ? "Confirm AI Match"
      : "Barangay Labangon — Dashboard";

  const viewSubtitle =
    activeView === "verify" && selectedReport
      ? `Submitted by citizen · ${selectedReport.barangay}`
      : activeView === "confirm-match" && selectedReport
      ? `Case ${selectedReport.id} — ${selectedReport.personName}`
      : "Cebu City LGU · First-Level Report Verification & AI Alert Review";

  const emptyState = (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-sm text-slate-500 shadow-xs">
      {loading
        ? "Loading live reports…"
        : "No reports to show yet. Reports filed from the mobile app or website will appear here instantly."}
    </div>
  );

  return (
    <BarangayShell
      title={viewTitle}
      subtitle={viewSubtitle}
      activeNav={
        activeView === "verify"
          ? "Reports"
          : activeView === "confirm-match"
          ? "Alerts"
          : "Dashboard"
      }
      onSelectNav={(label) => {
        if (label === "Dashboard" || label === "Cases") setActiveView("dashboard");
        if (label === "Reports" && selectedReport) {
          setSelectedId(selectedReport.id);
          setActiveView("verify");
        }
        if (label === "Alerts" && firstMatchRow) {
          setSelectedId(firstMatchRow.id);
          setActiveView("confirm-match");
        }
      }}
    >
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B2240] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-[#1967D2]">
          ✓ {toast}
        </div>
      )}

      <DataModeBanner
        live={live}
        loading={loading}
        error={error}
        configured={configured}
        authLoading={authLoading}
        loginHref="/barangay/login"
      />

      {/* Storyboard Screen Switcher Bar (Figure 27 & Figure 30) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
            Storyboard View:
          </span>
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeView === "dashboard"
                ? "bg-[#0B2240] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            1. Barangay Dashboard (Fig 27)
          </button>
          <button
            onClick={() => {
              if (selectedReport) setSelectedId(selectedReport.id);
              setActiveView("verify");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeView === "verify"
                ? "bg-[#0B2240] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            2. Verify Report (Fig 30.3)
          </button>
          <button
            onClick={() => {
              if (firstMatchRow) setSelectedId(firstMatchRow.id);
              setActiveView("confirm-match");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeView === "confirm-match"
                ? "bg-[#0B2240] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            3. Confirm AI Match (Fig 30.4)
          </button>
        </div>
      </div>

      {/* VIEW 1: FIGURE 27 (p. 90) — BARANGAY WEB DASHBOARD */}
      {activeView === "dashboard" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Active Cases</span>
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1967D2] flex items-center justify-center text-sm">
                  📋
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-[#1967D2]">
                {metrics.active}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {live ? "Open missing person reports" : "In Brgy. Labangon jurisdiction"}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">AI Matches</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                  🤖
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-emerald-600">
                {metrics.aiMatches}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Awaiting your review
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Pending Verify</span>
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm">
                  ⏳
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-amber-600">
                {metrics.pendingVerify}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Awaiting desk validation
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Escalated</span>
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm">
                  🚨
                </span>
              </div>
              <div className="text-3xl font-head font-extrabold text-rose-600">
                {metrics.escalated}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Forwarded to CCPO Station
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-2xl mb-5 w-fit shadow-xs">
            {["New Reports", `AI Alerts (${aiAlertCount})`, "Verified"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tab === t
                    ? "bg-[#1967D2] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {displayedReports.length === 0 ? (
            emptyState
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B2240] text-white text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Report</th>
                      <th className="py-3.5 px-5">Name / Age</th>
                      <th className="py-3.5 px-5">Submitted</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">AI Score</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {displayedReports.map((r, idx) => (
                      <tr
                        key={r.docId || r.id}
                        className={`${
                          idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                        } hover:bg-blue-50/40 transition-colors`}
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-600">{r.id}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              photoUrl={r.photoUrl}
                              initials={r.initials}
                              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-[#0B2240] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#0B2240]">{r.name}</div>
                              <div className="text-[11px] text-slate-400">{r.lastSeen}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium">{r.submitted}</td>
                        <td className="py-3.5 px-5">
                          {r.status === "New" && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              New
                            </span>
                          )}
                          {r.status === "Match" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              ● Match
                            </span>
                          )}
                          {r.status === "Escalated" && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              Escalated
                            </span>
                          )}
                          {r.status === "Verified" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                          {r.status === "Resolved" && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              ✓ Resolved
                            </span>
                          )}
                          {r.status === "Flagged" && (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              Flagged
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {r.scoreNum > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-[#1967D2] rounded-full"
                                  style={{ width: `${r.scoreNum}%` }}
                                />
                              </div>
                              <span className="font-extrabold text-[#1967D2]">{r.score}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">{r.score}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenAction(r)}
                            className="text-xs font-bold text-[#1967D2] bg-blue-50 hover:bg-[#1967D2] hover:text-white border border-blue-200/80 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Verify →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: FIGURE 30.3 (p. 93) — VERIFY REPORT */}
      {activeView === "verify" && !selectedReport && emptyState}
      {activeView === "verify" && selectedReport && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 max-w-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-28 h-32 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shrink-0 mx-auto sm:mx-0 overflow-hidden">
              {selectedReport.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedReport.photoUrl}
                  alt={selectedReport.personName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-blue-200/80 flex items-center justify-center text-[#0B2240] font-extrabold text-xl">
                    {selectedReport.initials}
                  </div>
                  <span className="text-[10px] font-bold text-[#1967D2] mt-2">No photo</span>
                </>
              )}
            </div>

            <div className="flex-1 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <h3 className="text-base font-head font-extrabold text-[#0B2240]">
                  {selectedReport.personName} — Missing Person
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                  {selectedReport.status === "New" ? "Pending Verification" : selectedReport.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-y-2 text-xs">
                <span className="text-slate-400 font-medium">Age / Gender:</span>
                <span className="font-bold text-slate-800">{selectedReport.ageGender}</span>

                <span className="text-slate-400 font-medium">Last seen:</span>
                <span className="font-bold text-slate-800">{selectedReport.lastSeen}</span>

                <span className="text-slate-400 font-medium">Reporter:</span>
                <span className="font-bold text-slate-800">{selectedReport.reporter}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-slate-600 italic text-xs mt-2">
                {selectedReport.description}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              disabled={busy}
              onClick={() => handleApproveReport(selectedReport)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              ✓ Approve &amp; Verify
            </button>
            <button
              disabled={busy}
              onClick={() => handleFlagReport(selectedReport)}
              className="bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-600 border border-rose-200 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
            >
              ✕ Flag Report
            </button>
            <button
              disabled={busy}
              onClick={() => handleForwardToCCPO(selectedReport)}
              className="bg-[#0B2240] hover:bg-[#16355D] disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Forward to CCPO →
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: FIGURE 30.4 (p. 93) — CONFIRM AI MATCH */}
      {activeView === "confirm-match" && !selectedReport && emptyState}
      {activeView === "confirm-match" && selectedReport && (
        <div className="max-w-2xl space-y-4">
          {live && !selectedReport.matchId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 flex flex-wrap items-center justify-between gap-2">
              <span>
                No AI match has been generated for this report yet. Click to scan against
                active sighting reports using the 80/20 engine.
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const target = allReports.find((r) => r.id === selectedReport.docId);
                  if (!target) return;
                  setBusy(true);
                  try {
                    const created = await runAiScanAndPersistMatches(
                      target,
                      allReports,
                      matches,
                      55
                    );
                    showNotification(
                      created.length
                        ? `80/20 AI Scan found ${created.length} candidate match(es)!`
                        : "AI Scan complete — no opposite-type reports above threshold yet."
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0B2240] text-white font-bold hover:bg-[#16355D] cursor-pointer"
              >
                ✨ Run 80/20 AI Scan
              </button>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
              <div>
                <div className="text-emerald-900 font-extrabold text-xs sm:text-sm">
                  AI Facial &amp; Description Match Detected (80/20 Weighted)
                </div>
                <div className="text-[11px] text-emerald-700">
                  {selectedReport.facialScore != null && selectedReport.textScore != null
                    ? `0.80 × ${selectedReport.facialScore}% (Facial) + 0.20 × ${selectedReport.textScore}% (NLP)`
                    : "0.80 × 88.5% (DeepFace Facial) + 0.20 × 85.2% (spaCy NLP) = 87.8%"}
                </div>
              </div>
            </div>
            <div className="text-2xl font-head font-extrabold text-emerald-700">
              {selectedReport.scoreNum > 0 ? `${selectedReport.scoreNum}%` : "87%"}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1967D2] mb-3">
                  Missing Person Report
                </span>
                <Avatar
                  photoUrl={selectedReport.photoUrl}
                  initials={selectedReport.initials}
                  className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 mx-auto mb-3 flex items-center justify-center text-lg font-extrabold text-[#0B2240]"
                />
                <div className="font-bold text-sm text-[#0B2240]">
                  {selectedReport.personName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Missing · {selectedReport.barangay}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mb-3">
                  Found / Sighting Report
                </span>
                {live ? (
                  <>
                    <Avatar
                      photoUrl={sighting?.photoUrl}
                      initials="UF"
                      className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 mx-auto mb-3 flex items-center justify-center text-lg font-extrabold text-emerald-800"
                    />
                    <div className="font-bold text-sm text-[#0B2240]">
                      {sighting ? sighting.name : "No sighting linked"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {sighting
                        ? `Sighting · ${sighting.location || sighting.barangay}`
                        : "—"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 mx-auto mb-3 flex items-center justify-center text-lg font-extrabold text-emerald-800">
                      UF
                    </div>
                    <div className="font-bold text-sm text-[#0B2240]">Unidentified F.</div>
                    <div className="text-xs text-slate-500 mt-0.5">Found · Brgy. Mabolo</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">
                  📸 Facial Embedding Similarity (80% Weight)
                </span>
                <span className="font-mono font-bold text-[#0E8FA3]">
                  {selectedReport.facialScore ?? 88.5}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">
                  📝 NLP Text Description Match (20% Weight)
                </span>
                <span className="font-mono font-bold text-[#1967D2]">
                  {selectedReport.textScore ?? 85.2}%
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-800 font-extrabold">
                    Weighted Match Confidence (80/20)
                  </span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {selectedReport.scoreNum > 0 ? `${selectedReport.scoreNum}%` : "87%"}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${selectedReport.scoreNum > 0 ? selectedReport.scoreNum : 87}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                disabled={busy || (live && !selectedReport.matchId)}
                onClick={() => handleConfirmMatch(selectedReport)}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                ✓ Confirm Match &amp; Notify
              </button>
              <Link
                href={
                  selectedReport.matchId
                    ? `/match-alert?id=${selectedReport.matchId}`
                    : "/match-alert"
                }
                className="bg-blue-50 hover:bg-blue-100 text-[#1967D2] border border-blue-200 font-bold text-xs py-3 rounded-xl text-center transition-colors"
              >
                🔍 Open FISWG Rubric
              </Link>
              <button
                disabled={busy}
                onClick={() => handleDismissMatch(selectedReport)}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
              >
                {live && selectedReport.matchId ? "Send for Manual Review" : "Dismiss Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BarangayShell>
  );
}
