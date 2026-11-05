"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function MatchAlertPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-head font-extrabold text-2xl text-navy-900">AI Match Alert</h1>
          <p className="text-sm text-ink-500 mt-1">
            Potential missing person match detected via dual AI pipeline
          </p>
        </div>

        {confirmed ? (
          <Card className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-success text-3xl mx-auto flex items-center justify-center">
              ✓
            </div>
            <h2 className="font-head font-extrabold text-xl text-navy-900">
              Match Confirmed
            </h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              You confirmed the match for <strong>Maria Santos (Case #2038)</strong>. Brgy. Labangon and Cebu City Police Office (CCPO Station 10) have been immediately notified.
            </p>
            <div className="pt-4">
              <Link href="/case-status">
                <Button variant="primary">View Case Progress Timeline</Button>
              </Link>
            </div>
          </Card>
        ) : dismissed ? (
          <Card className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-ink-400 text-3xl mx-auto flex items-center justify-center">
              ✕
            </div>
            <h2 className="font-head font-extrabold text-xl text-navy-900">
              Match Dismissed
            </h2>
            <p className="text-sm text-ink-500">
              This candidate match has been logged as dismissed. The AI engine will continue scanning across Cebu City reports.
            </p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-[#0E8FA3] text-xs font-extrabold px-3.5 py-1.5 rounded-full">
                ✨ Dual AI Matching Active
              </div>
              <span className="text-xs font-mono text-ink-400">Match ID #101</span>
            </div>

            {/* Side-by-Side Profiles (Figure 14) */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 text-center p-3 rounded-lg bg-paper border border-line">
                <div className="w-20 h-20 mx-auto rounded-md bg-brand-100 flex items-center justify-center text-3xl text-brand-600 shadow-sm">
                  👩
                </div>
                <div className="text-sm font-bold text-navy-900 mt-2">Maria Santos</div>
                <div className="text-xs text-ink-400">Missing · Brgy. Labangon</div>
              </div>

              <div className="text-brand-600 font-extrabold text-xl">↔</div>

              <div className="flex-1 text-center p-3 rounded-lg bg-paper border border-line">
                <div className="w-20 h-20 mx-auto rounded-md bg-teal-100 flex items-center justify-center text-3xl text-teal-700 shadow-sm">
                  ❔
                </div>
                <div className="text-sm font-bold text-navy-900 mt-2">Unidentified F.</div>
                <div className="text-xs text-ink-400">Found · Brgy. Mabolo</div>
              </div>
            </div>

            {/* DUAL SIMILARITY SCORES (Objective 2 Requirement) */}
            <div className="bg-slate-50 border border-line rounded-lg p-4 mb-6 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                Objective 2: AI Similarity Breakdown
              </div>

              {/* 1. Facial Recognition Similarity */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-navy-900 flex items-center gap-1.5">
                    📸 Facial Feature Embedding (FaceNet)
                  </span>
                  <span className="text-[#0E8FA3] font-mono text-sm">88.5%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: "88.5%" }} />
                </div>
              </div>

              {/* 2. Text Description Similarity */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-navy-900 flex items-center gap-1.5">
                    📝 NLP Text Description Matching
                  </span>
                  <span className="text-brand-600 font-mono text-sm">85.2%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: "85.2%" }} />
                </div>
              </div>

              {/* Aggregate Score */}
              <div className="pt-2 border-t border-dashed border-line flex justify-between items-center">
                <span className="text-xs font-extrabold text-navy-900">Overall Match Confidence</span>
                <span className="text-base font-extrabold font-head text-brand-600">87.0%</span>
              </div>
            </div>

            {/* Matched Attributes Checklist (Figure 14) */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">
                ✓ Age match (34 vs mid-30s)
              </span>
              <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">
                ✓ Gender match (Female)
              </span>
              <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">
                ✓ Location proximity (5.4 km)
              </span>
              <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">
                ✓ Clothing overlap (blue jeans, eyeglasses)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setConfirmed(true)}
                variant="primary"
                className="flex-1 text-sm py-3"
              >
                ✓ Confirm Match
              </Button>
              <Button
                onClick={() => setDismissed(true)}
                variant="outline"
                className="flex-1 text-sm py-3 !text-ink-700 hover:!bg-red-50 hover:!border-danger hover:!text-danger"
              >
                Dismiss Match
              </Button>
            </div>

            <p className="text-[11px] text-ink-400 text-center mt-5 leading-relaxed">
              Confirming notifies the reporting family, Brgy. Labangon, and the Cebu City Police Office (CCPO).
            </p>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
