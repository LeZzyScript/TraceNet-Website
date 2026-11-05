"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CCPOShell from "@/components/CCPOShell";
import DataModeBanner from "@/components/DataModeBanner";
import { useLiveCases } from "@/lib/useLiveCases";
import { resolveReport } from "@/lib/liveData";
import { toCcpoRow } from "@/lib/reportMapper";

// Demo rows: manuscript Figure 25 (p. 88). Used only when no CCPO account is signed in.
const demoCases = [
  {
    id: "#2038",
    initials: "MS",
    name: "Maria Santos, 34",
    barangay: "Labangon",
    status: "● Match",
    statusBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    score: "87%",
    scoreNum: 87,
    category: "active",
    officer: "PO2 Juan dela Cruz",
    notes: "AI Facial Match (88.5%) + NLP Text Match (81.0%) = 87% combined confidence with Found Report #5012 in Brgy. Mabolo.",
  },
  {
    id: "#2041",
    initials: "PR",
    name: "Pedro Reyes, 72",
    barangay: "Guadalupe",
    status: "Escalated",
    statusBadge: "bg-rose-50 text-rose-700 border border-rose-200",
    score: "—",
    scoreNum: 0,
    category: "escalated",
    officer: "SPO1 Marco Villamor",
    notes: "Elderly person with dementia unresolved > 48 hrs. Escalated to District 3 Station.",
  },
  {
    id: "#2042",
    initials: "LT",
    name: "Liza Tan, 16",
    barangay: "Mabolo",
    status: "New",
    statusBadge: "bg-amber-50 text-amber-700 border border-amber-200",
    score: "Pend.",
    scoreNum: 0,
    category: "active",
    officer: "Unassigned",
    notes: "Forwarded by Brgy. Mabolo desk officer. AI scan in progress.",
  },
  {
    id: "#2039",
    initials: "RC",
    name: "Ramon Cruz, 45",
    barangay: "Pardo",
    status: "Active",
    statusBadge: "bg-amber-50 text-amber-700 border border-amber-200",
    score: "54%",
    scoreNum: 54,
    category: "active",
    officer: "PO3 Elena Gomez",
    notes: "Patrol unit dispatched near Pardo Public Market.",
  },
  {
    id: "#2040",
    initials: "AR",
    name: "Ana Reyes, 8",
    barangay: "Talamban",
    status: "Active",
    statusBadge: "bg-amber-50 text-amber-700 border border-amber-200",
    score: "—",
    scoreNum: 0,
    category: "active",
    officer: "PO2 Ryan Lim",
    notes: "Coordinating with Talamban Barangay Hall.",
  },
  {
    id: "#2036",
    initials: "JB",
    name: "Jose B., 38",
    barangay: "Lahug",
    status: "✓ Resolved",
    statusBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    score: "91%",
    scoreNum: 91,
    category: "resolved",
    officer: "PO2 Juan dela Cruz",
    notes: "Confirmed match reunited with family. Temporary candidate photos purged per RA 10173.",
  },
  {
    id: "#2035",
    initials: "CF",
    name: "Carmen F., 55",
    barangay: "Guadalupe",
    status: "✓ Resolved",
    statusBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    score: "—",
    scoreNum: 0,
    category: "resolved",
    officer: "SPO1 Marco Villamor",
    notes: "Located safely and verified by Brgy. Guadalupe.",
  },
];

export default function CCPOCasesPage() {
  const {
    configured,
    authLoading,
    live,
    loading,
    error,
    user,
    reports: liveReports,
    matchByReport,
  } = useLiveCases(["ccpo_officer", "admin"]);

  const [demoRows, setDemoRows] = useState(demoCases);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [showBlotter, setShowBlotter] = useState(false);
  const [actionError, setActionError] = useState("");

  const cases = useMemo(
    () =>
      live ? liveReports.map((r) => toCcpoRow(r, matchByReport.get(r.id))) : demoRows,
    [live, liveReports, matchByReport, demoRows]
  );

  const counts = live
    ? {
        active: cases.filter((c) => c.category === "active").length,
        escalated: cases.filter((c) => c.category === "escalated").length,
        resolved: cases.filter((c) => c.category === "resolved").length,
      }
    : { active: 45, escalated: 3, resolved: 7 };
  const totalCases = live ? cases.length : 48;

  const filtered = cases.filter((c) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "active"
        ? c.category === "active"
        : activeTab === "escalated"
        ? c.category === "escalated"
        : c.category === "resolved";

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.barangay.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  async function handleResolveCase(c) {
    setActionError("");
    if (live) {
      try {
        await resolveReport(c.docId, {
          uid: user?.uid,
          name: user?.displayName || user?.email,
        });
      } catch (e) {
        setActionError(
          e?.code === "permission-denied"
            ? "Action blocked: Firestore denied the write for this account."
            : "Could not resolve the case. Please try again."
        );
        return;
      }
    } else {
      setDemoRows((prev) =>
        prev.map((row) =>
          row.id === c.id
            ? {
                ...row,
                status: "✓ Resolved",
                statusBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                category: "resolved",
                notes: row.notes + " [Case Closed & Unmatched Candidate Photos Purged per RA 10173]",
              }
            : row
        )
      );
    }
    setSelectedCase(null);
  }

  return (
    <CCPOShell title="Case Management">
      <DataModeBanner
        live={live}
        loading={loading}
        error={error}
        configured={configured}
        authLoading={authLoading}
        loginHref="/ccpo/login"
      />
      {actionError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
          {actionError}
        </div>
      )}
      {/* Segmented Filter Bar & Search (Figure 25 p. 88) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          {[
            { id: "all", label: "All Cases" },
            { id: "active", label: `Active (${counts.active})` },
            { id: "escalated", label: `Escalated (${counts.escalated})` },
            { id: "resolved", label: `Resolved (${counts.resolved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1967D2] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search cases, ID, barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1967D2]"
          />
        </div>
      </div>

      {/* Case Management Table with Dark Navy Header (Figure 25 p. 88) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2240] text-white text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Name / Age</th>
                <th className="py-3.5 px-5">Barangay</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">AI Score</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c, idx) => (
                <tr
                  key={c.docId || c.id}
                  className={`${
                    idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                  } hover:bg-blue-50/40 transition-colors`}
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-500">{c.id}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-[#0B2240] shrink-0">
                        {c.initials}
                      </div>
                      <div>
                        <div className="font-bold text-[#0B2240]">{c.name}</div>
                        <div className="text-[11px] text-slate-400">Officer: {c.officer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-600">{c.barangay}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${c.statusBadge}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {c.scoreNum > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#1967D2] rounded-full"
                            style={{ width: `${c.scoreNum}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#1967D2]">{c.score}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">{c.score}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCase(c)}
                      className="text-xs font-bold text-[#1967D2] bg-blue-50 hover:bg-[#1967D2] hover:text-white border border-blue-200/80 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Figure 25 p. 88) */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/40">
          <span>
            {filtered.length === 0
              ? "No cases to show"
              : `Showing 1–${filtered.length} of ${totalCases} cases`}
          </span>
          <div className="flex items-center gap-1">
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400">‹</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0B2240] text-white font-bold">1</span>
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">2</span>
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">3</span>
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 cursor-pointer">›</span>
          </div>
        </div>
      </div>

      {/* Case Record & Digital Blotter Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-head font-extrabold text-base text-[#0B2240]">
                  Case {selectedCase.id} — {selectedCase.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Origin: Brgy. {selectedCase.barangay} · Assigned: {selectedCase.officer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(null);
                  setShowBlotter(false);
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            {!showBlotter ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block mb-1">Current Status</span>
                    <span className="font-bold text-[#0B2240] text-sm">{selectedCase.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">AI Match Score (80/20)</span>
                    <span className="font-extrabold text-[#1967D2] text-sm">{selectedCase.score}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Investigation Notes</label>
                  <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed">
                    {selectedCase.notes}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/match-alert"
                      className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#1967D2] border border-blue-200 font-bold hover:bg-blue-100"
                    >
                      🔍 FISWG Match Rubric
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowBlotter(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-[#0B2240] font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      📄 Digital Blotter
                    </button>
                  </div>

                  {selectedCase.category !== "resolved" && (
                    <button
                      type="button"
                      onClick={() => handleResolveCase(selectedCase)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono space-y-2">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <div className="font-bold text-[#0B2240]">REPUBLIC OF THE PHILIPPINES</div>
                    <div className="font-bold text-[#0B2240]">CEBU CITY POLICE OFFICE (CCPO)</div>
                    <div className="text-[10px] text-slate-500">OFFICIAL DIGITAL BLOTTER EXTRACT</div>
                  </div>
                  <div><strong>BLOTTER ENTRY NO:</strong> CCPO-2026-{selectedCase.id.replace("#", "")}</div>
                  <div><strong>SUBJECT:</strong> {selectedCase.name} (Missing Person)</div>
                  <div><strong>JURISDICTION:</strong> Barangay {selectedCase.barangay}, Cebu City</div>
                  <div><strong>INVESTIGATING OFFICER:</strong> {selectedCase.officer}</div>
                  <div><strong>AI MATCH CONFIDENCE:</strong> {selectedCase.score} (80% Facial / 20% NLP)</div>
                  <div><strong>SUMMARY:</strong> {selectedCase.notes}</div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBlotter(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-[#1967D2] text-white font-bold"
                  >
                    🖨️ Print Blotter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </CCPOShell>
  );
}
