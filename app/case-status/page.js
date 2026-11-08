"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { useLiveCases } from "@/lib/useLiveCases";
import {
  cancelReportWithReason,
  forwardReport,
  updateReportDetails,
} from "@/lib/liveData";

const DEMO_STAGES = [
  { title: "Report submitted", meta: "June 28, 9:14 AM", state: "done" },
  { title: "Verified by barangay", meta: "Brgy. Labangon — June 28, 11:02 AM", state: "done" },
  { title: "AI matching in progress", meta: "Scanning against 48 found reports", state: "active" },
  { title: "Forwarded to CCPO", meta: "Pending", state: "pending" },
  { title: "Case resolved", meta: "Pending", state: "pending" },
];

const CANCEL_REASONS = [
  "Missing person returned home safely",
  "Located with family member / hospital",
  "Duplicate report filed",
  "Entered incorrect report details",
];

const dotStyle = {
  done: "bg-success text-white",
  active: "bg-brand-600 text-white ring-4 ring-brand-100",
  pending: "bg-[#E8ECF4] text-ink-400",
};

function buildLiveStages(report, match) {
  const statusRank = {
    submitted: 1,
    verified: 2,
    forwarded: 4,
    resolved: 5,
  };
  const rank = statusRank[report.status] || 1;
  const submittedStr = report.createdAt ? report.createdAt.toLocaleString() : "Just now";

  return [
    {
      title: "Report submitted",
      meta: submittedStr,
      state: "done",
    },
    {
      title: "Verified by barangay",
      meta:
        rank >= 2
          ? `Brgy. ${report.barangay} — Verified`
          : `Awaiting Brgy. ${report.barangay} verification`,
      state: rank >= 2 ? "done" : rank === 1 ? "active" : "pending",
    },
    {
      title: "AI matching in progress",
      meta: match
        ? `${match.confidence}% AI candidate match found (${match.status})`
        : "Scanning against active sighting & missing reports",
      state: rank >= 4 ? "done" : rank === 2 ? "active" : "pending",
    },
    {
      title: "Forwarded to CCPO",
      meta: rank >= 4 ? "Escalated to Cebu City Police Office" : "Pending",
      state: rank >= 5 ? "done" : rank === 4 ? "active" : "pending",
    },
    {
      title: "Case resolved",
      meta: rank >= 5 ? "Resolved & closed" : "Pending",
      state: rank >= 5 ? "done" : "pending",
    },
  ];
}

function CaseStatusInner() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  const { user } = useAuth();
  const { live, reports, bestByReport } = useLiveCases();

  const liveReport = useMemo(() => {
    if (!live || !reportId) return null;
    return reports.find((r) => r.id === reportId) || null;
  }, [live, reportId, reports]);

  const liveMatch = liveReport ? bestByReport.get(liveReport.id) : null;

  // Demo overrides so Edit, Cancel, and Escalate work interactively in demo mode too
  const [demoEscalated, setDemoEscalated] = useState(false);
  const [demoWithdrawnReason, setDemoWithdrawnReason] = useState("");
  const [demoDetails, setDemoDetails] = useState({
    name: "Maria Santos, 34, Female",
    location: "Brgy. Labangon",
    description: "White blouse, blue jeans, wearing eyeglasses",
    reporter: "Juan dela Cruz",
    assigned: "Brgy. Labangon + CCPO",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  function notify(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const stages = useMemo(() => {
    if (liveReport) return buildLiveStages(liveReport, liveMatch);
    if (demoWithdrawnReason) {
      return DEMO_STAGES.map((s) => ({
        ...s,
        state: "done",
        meta: s.title === "Case resolved" ? `Withdrawn: ${demoWithdrawnReason}` : s.meta,
      }));
    }
    if (demoEscalated) {
      return [
        DEMO_STAGES[0],
        DEMO_STAGES[1],
        { ...DEMO_STAGES[2], state: "done" },
        {
          title: "Forwarded to CCPO",
          meta: "Escalated directly to CCPO Station 10",
          state: "active",
        },
        DEMO_STAGES[4],
      ];
    }
    return DEMO_STAGES;
  }, [liveReport, liveMatch, demoEscalated, demoWithdrawnReason]);

  const caseTitle = liveReport ? `Case ${liveReport.caseCode}` : "Case #2038";
  const isResolved =
    liveReport?.status === "resolved" || Boolean(demoWithdrawnReason);

  const details = liveReport
    ? [
        [
          "Name",
          [liveReport.name, liveReport.age, liveReport.sex].filter(Boolean).join(", "),
        ],
        ["Last seen", liveReport.location],
        ["Description", liveReport.description || "—"],
        ["Reported by", liveReport.reportedByName],
        ["Assigned to", `Brgy. ${liveReport.barangay} + CCPO`],
      ]
    : [
        ["Name", demoDetails.name],
        ["Last seen", demoDetails.location],
        ["Description", demoDetails.description],
        ["Reported by", demoDetails.reporter],
        ["Assigned to", demoDetails.assigned],
      ];

  function openEdit() {
    setEditLocation(liveReport ? liveReport.location : demoDetails.location);
    setEditDescription(
      liveReport ? liveReport.description : demoDetails.description
    );
    setShowEditModal(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (liveReport && user) {
        await updateReportDetails(
          liveReport.id,
          {
            location: editLocation.trim(),
            description: editDescription.trim(),
          },
          { uid: user.uid, name: user.displayName || user.email }
        );
      } else {
        setDemoDetails((d) => ({
          ...d,
          location: editLocation.trim() || d.location,
          description: editDescription.trim() || d.description,
        }));
      }
      setShowEditModal(false);
      notify("Report details updated and synced with AI matching engine.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmCancel(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (liveReport && user) {
        await cancelReportWithReason(liveReport.id, cancelReason, {
          uid: user.uid,
          name: user.displayName || user.email,
        });
      } else {
        setDemoWithdrawnReason(cancelReason);
      }
      setShowCancelModal(false);
      notify(`Report closed (${cancelReason}). Authorities notified.`);
    } finally {
      setBusy(false);
    }
  }

  async function handleEscalate() {
    setBusy(true);
    try {
      if (liveReport && user) {
        await forwardReport(liveReport.id, {
          uid: user.uid,
          name: user.displayName || user.email,
        });
      } else {
        setDemoEscalated(true);
      }
      notify("Case escalated directly to Cebu City Police Office (CCPO) Command Center.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {toast && (
        <div className="mb-4 rounded-md bg-navy-900 text-white text-xs font-bold px-4 py-3 shadow-md">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-head font-extrabold text-2xl text-navy-900">{caseTitle}</h1>
        <span
          className={`text-xs font-bold ${
            isResolved ? "text-ink-500" : "text-success"
          }`}
        >
          ● {isResolved ? "Resolved / Closed" : "Active"}
        </span>
      </div>
      <p className="text-sm text-ink-500 mb-8">
        {liveReport?.createdAt
          ? `Submitted ${liveReport.createdAt.toLocaleString()}`
          : "Last updated 2 hrs ago"}
      </p>

      <div className="mb-8">
        {stages.map((s, i) => (
          <div key={s.title} className="flex gap-3.5 relative pb-6 last:pb-0">
            {i < stages.length - 1 && (
              <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-line" />
            )}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 z-10 ${dotStyle[s.state]}`}
            >
              {s.state === "done" ? "✓" : s.state === "active" ? "●" : i + 1}
            </div>
            <div>
              <div
                className={`text-sm font-bold ${
                  s.state === "pending" ? "text-ink-400" : "text-navy-900"
                }`}
              >
                {s.title}
              </div>
              <div className="text-xs text-ink-400">{s.meta}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className="p-4 mb-5">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 text-sm py-2 border-b border-dashed border-line last:border-none"
          >
            <span className="text-ink-400 shrink-0">{label}</span>
            <span className="font-semibold text-navy-900 text-right">{value}</span>
          </div>
        ))}
      </Card>

      {liveMatch && (
        <Button href="/match-alert" variant="primary" className="w-full mb-3">
          View AI Match Alert ({liveMatch.confidence}% confidence)
        </Button>
      )}

      {/* Citizen Workflow Actions (Manuscript Fig 3.1 & IT-C5) */}
      {!isResolved && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={openEdit}
              className="py-2.5 px-3 rounded-md border border-line bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 transition-colors cursor-pointer"
            >
              ✏️ Edit Report Details
            </button>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="py-2.5 px-3 rounded-md border border-line bg-white hover:bg-slate-50 text-xs font-bold text-ink-600 transition-colors cursor-pointer"
            >
              ✕ Withdraw / Cancel Report
            </button>
          </div>

          <Button
            type="button"
            onClick={handleEscalate}
            disabled={busy || demoEscalated}
            variant="outline"
            className="w-full !border-danger !text-danger"
          >
            {demoEscalated
              ? "✓ Escalated to CCPO Command"
              : "🚨 Escalate to CCPO directly"}
          </Button>
        </div>
      )}

      {/* Edit Report Modal (Fig 3.1 / IT-C5) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-line shadow-xl">
            <h3 className="font-head font-extrabold text-base text-navy-900 mb-1">
              Edit Report Details (Fig 3.1)
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Update last-seen location or clothing descriptors to refine the 80/20 AI search.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Last Seen Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2 text-xs text-navy-900"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Clothing &amp; Physical Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2 text-xs text-navy-900"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-2 rounded-md border border-line font-bold text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-md bg-brand-600 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel / Withdraw Report Modal (Fig 3.1) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-line shadow-xl">
            <h3 className="font-head font-extrabold text-base text-navy-900 mb-1">
              Withdraw / Cancel Report (Fig 3.1)
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Select the reason for closing this report. Barangay officials and CCPO will be notified.
            </p>
            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div className="space-y-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2.5 p-2.5 rounded-md border border-line bg-paper cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                    />
                    <span className="font-semibold text-navy-900">{r}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3.5 py-2 rounded-md border border-line font-bold text-ink-600"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-md bg-danger text-white font-bold"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaseStatusPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="text-sm text-ink-500">Loading case status...</div>}>
        <CaseStatusInner />
      </Suspense>
    </DashboardShell>
  );
}
