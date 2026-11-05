"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLiveCases } from "@/lib/useLiveCases";

const DEMO_STAGES = [
  { title: "Report submitted", meta: "June 28, 9:14 AM", state: "done" },
  { title: "Verified by barangay", meta: "Brgy. Labangon — June 28, 11:02 AM", state: "done" },
  { title: "AI matching in progress", meta: "Scanning against 48 found reports", state: "active" },
  { title: "Forwarded to CCPO", meta: "Pending", state: "pending" },
  { title: "Case resolved", meta: "Pending", state: "pending" },
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
  const { live, reports, bestByReport } = useLiveCases();

  const liveReport = useMemo(() => {
    if (!live || !reportId) return null;
    return reports.find((r) => r.id === reportId) || null;
  }, [live, reportId, reports]);

  const liveMatch = liveReport ? bestByReport.get(liveReport.id) : null;
  const stages = liveReport ? buildLiveStages(liveReport, liveMatch) : DEMO_STAGES;

  const caseTitle = liveReport ? `Case ${liveReport.caseCode}` : "Case #2038";
  const isResolved = liveReport?.status === "resolved";
  const details = liveReport
    ? [
        [
          "Name",
          [liveReport.name, liveReport.age, liveReport.sex].filter(Boolean).join(", "),
        ],
        ["Last seen", liveReport.location],
        ["Reported by", liveReport.reportedByName],
        ["Assigned to", `Brgy. ${liveReport.barangay} + CCPO`],
      ]
    : [
        ["Name", "Maria Santos, 34, Female"],
        ["Last seen", "Brgy. Labangon"],
        ["Reported by", "Juan dela Cruz"],
        ["Assigned to", "Brgy. Labangon + CCPO"],
      ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-head font-extrabold text-2xl text-navy-900">{caseTitle}</h1>
        <span
          className={`text-xs font-bold ${
            isResolved ? "text-ink-500" : "text-success"
          }`}
        >
          ● {isResolved ? "Resolved" : "Active"}
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

      <Card className="p-4 mb-6">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between text-sm py-2 border-b border-dashed border-line last:border-none"
          >
            <span className="text-ink-400">{label}</span>
            <span className="font-semibold text-navy-900 text-right">{value}</span>
          </div>
        ))}
      </Card>

      {liveMatch && (
        <Button
          href="/match-alert"
          variant="primary"
          className="w-full mb-3"
        >
          View AI Match Alert ({liveMatch.confidence}% confidence)
        </Button>
      )}

      <Button variant="outline" className="w-full !border-danger !text-danger">
        Escalate to CCPO directly
      </Button>
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
