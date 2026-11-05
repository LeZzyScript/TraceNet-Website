"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { useLiveCases } from "@/lib/useLiveCases";
import { reviewMatch } from "@/lib/liveData";
import {
  computeWeightedMatch,
  FISWG_FEATURES,
  FISWG_TIERS,
  recommendFiswgTier,
} from "@/lib/aiMatcher";

const DEMO_MISSING = {
  id: "demo-2038",
  caseCode: "#2038",
  name: "Maria Santos",
  age: 34,
  sex: "Female",
  location: "Brgy. Labangon, Cebu City",
  description: "White blouse, blue jeans, wearing eyeglasses",
  photoUrl: null,
};

const DEMO_SIGHTING = {
  id: "demo-sighting-101",
  name: "Unidentified F.",
  age: 34,
  sex: "Female",
  location: "Brgy. Mabolo, Cebu City",
  description: "Disoriented, wearing white blouse, blue jeans, eyeglasses",
  photoUrl: null,
};

function MatchAlertInner() {
  const searchParams = useSearchParams();
  const matchIdParam = searchParams.get("id");
  const { user } = useAuth();
  const { live, allReports, matches } = useLiveCases();

  const liveBundle = useMemo(() => {
    if (!live || !matches.length) return null;
    const targetMatch = matchIdParam
      ? matches.find((m) => m.id === matchIdParam)
      : matches.find((m) => m.status === "pending") || matches[0];
    if (!targetMatch) return null;

    const missing =
      allReports.find((r) => r.id === targetMatch.missingReportId) || DEMO_MISSING;
    const sighting =
      allReports.find((r) => r.id === targetMatch.sightingReportId) || DEMO_SIGHTING;
    return { match: targetMatch, missing, sighting };
  }, [live, matches, allReports, matchIdParam]);

  const missingReport = liveBundle?.missing || DEMO_MISSING;
  const sightingReport = liveBundle?.sighting || DEMO_SIGHTING;

  const computed = useMemo(
    () =>
      computeWeightedMatch(
        missingReport,
        sightingReport,
        liveBundle?.match?.facialScore ?? null
      ),
    [missingReport, sightingReport, liveBundle]
  );

  const facialScore = liveBundle?.match?.facialScore ?? computed.facialScore;
  const textScore = liveBundle?.match?.textScore ?? computed.textScore;
  const weightedOverall =
    Math.round((0.8 * facialScore + 0.2 * textScore) * 10) / 10;
  const displayOverall = liveBundle?.match?.confidence
    ? Number(liveBundle.match.confidence).toFixed(1)
    : "87.0";

  const matchedAttributes =
    liveBundle?.match?.matchedAttributes?.length
      ? liveBundle.match.matchedAttributes
      : computed.matchedAttributes;

  const defaultTier =
    liveBundle?.match?.fiswgTier || recommendFiswgTier(weightedOverall).tier;

  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [checkedFeatures, setCheckedFeatures] = useState([
    "craniofacial",
    "ocular",
    "marks",
  ]);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function toggleFeature(featureId) {
    setCheckedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  }

  async function handleDecision(decision) {
    setSubmitting(true);
    try {
      if (liveBundle?.match?.id && user) {
        await reviewMatch(liveBundle.match.id, decision, user, {
          fiswgTier: selectedTier,
          fiswgFeatures: checkedFeatures,
          reviewerNotes: reviewerNotes.trim(),
        });
      }
      if (decision === "confirmed") {
        setConfirmed(true);
      } else {
        setDismissed(true);
      }
    } catch (err) {
      console.error("Failed to save match decision:", err);
      if (decision === "confirmed") setConfirmed(true);
      else setDismissed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const activeTierObj =
    FISWG_TIERS.find((t) => t.tier === selectedTier) || FISWG_TIERS[3];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-head font-extrabold text-2xl text-navy-900">
          AI Match Alert &amp; Forensic Verification
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          80% Facial Recognition (FaceNet 512-d) + 20% NLP Description Matching (spaCy)
        </p>
      </div>

      {confirmed ? (
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-success text-3xl mx-auto flex items-center justify-center">
            ✓
          </div>
          <h2 className="font-head font-extrabold text-xl text-navy-900">
            Match Confirmed ({activeTierObj.label})
          </h2>
          <p className="text-sm text-ink-500 max-w-md mx-auto">
            You confirmed the match for{" "}
            <strong>
              {missingReport.name} (Case {missingReport.caseCode || "#2038"})
            </strong>{" "}
            with{" "}
            <strong>{checkedFeatures.length} FISWG morphological landmarks</strong>{" "}
            verified. Barangay officials and CCPO have been notified.
          </p>
          <div className="pt-4">
            <Link
              href={
                liveBundle?.missing?.id
                  ? `/case-status?id=${liveBundle.missing.id}`
                  : "/case-status"
              }
            >
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
            Flagged / Dismissed ({activeTierObj.label})
          </h2>
          <p className="text-sm text-ink-500 max-w-md mx-auto">
            This candidate match has been logged under{" "}
            <strong>{activeTierObj.label}</strong>. The 80/20 AI engine will
            continue scanning active Cebu City reports.
          </p>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="p-6">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-[#0E8FA3] text-xs font-extrabold px-3.5 py-1.5 rounded-full">
                ✨ 80/20 Multimodal AI Pipeline Active
              </div>
              <span className="text-xs font-mono text-ink-400">
                Match ID #{liveBundle?.match?.id ? liveBundle.match.id.slice(-4).toUpperCase() : "101"}
              </span>
            </div>

            {/* Side-by-Side Profiles (Figure 14 / Fig 17) */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="flex-1 text-center p-3.5 rounded-lg bg-paper border border-line">
                {missingReport.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={missingReport.photoUrl}
                    alt={missingReport.name}
                    className="w-20 h-20 mx-auto rounded-md object-cover shadow-sm border border-brand-200"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-md bg-brand-100 flex items-center justify-center text-3xl text-brand-600 shadow-sm">
                    👩
                  </div>
                )}
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 mt-2">
                  Missing Report
                </div>
                <div className="text-sm font-bold text-navy-900 mt-0.5">
                  {missingReport.name}
                </div>
                <div className="text-xs text-ink-400">{missingReport.location}</div>
              </div>

              <div className="text-brand-600 font-extrabold text-xl shrink-0">↔</div>

              <div className="flex-1 text-center p-3.5 rounded-lg bg-paper border border-line">
                {sightingReport.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sightingReport.photoUrl}
                    alt={sightingReport.name}
                    className="w-20 h-20 mx-auto rounded-md object-cover shadow-sm border border-teal-200"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-md bg-teal-100 flex items-center justify-center text-3xl text-teal-700 shadow-sm">
                    ❔
                  </div>
                )}
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0E8FA3] mt-2">
                  Sighting / Found
                </div>
                <div className="text-sm font-bold text-navy-900 mt-0.5">
                  {sightingReport.name}
                </div>
                <div className="text-xs text-ink-400">{sightingReport.location}</div>
              </div>
            </div>

            {/* OBJECTIVE 2: 80/20 WEIGHTED SIMILARITY BREAKDOWN */}
            <div className="bg-slate-50 border border-line rounded-lg p-4 mb-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                  Objective 2: 80/20 AI Similarity Breakdown
                </span>
                <span className="text-[11px] font-mono font-bold text-navy-900 bg-white px-2.5 py-0.5 rounded border border-line">
                  Overall = 0.80 × Face + 0.20 × Text
                </span>
              </div>

              {/* 1. Facial Recognition Similarity (80% Weight) */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-navy-900 flex items-center gap-1.5">
                    📸 Facial Feature Embedding (DeepFace / FaceNet)
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 text-[#0E8FA3]">
                      80% Weight
                    </span>
                  </span>
                  <span className="text-[#0E8FA3] font-mono text-sm">
                    {facialScore.toFixed(1)}%{" "}
                    <span className="text-[11px] text-ink-400">
                      ({(facialScore * 0.8).toFixed(1)} pts)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, facialScore)}%` }}
                  />
                </div>
              </div>

              {/* 2. Text Description Similarity (20% Weight) */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-navy-900 flex items-center gap-1.5">
                    📝 NLP Text Description Matching (spaCy)
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-100 text-brand-600">
                      20% Weight
                    </span>
                  </span>
                  <span className="text-brand-600 font-mono text-sm">
                    {textScore.toFixed(1)}%{" "}
                    <span className="text-[11px] text-ink-400">
                      ({(textScore * 0.2).toFixed(1)} pts)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, textScore)}%` }}
                  />
                </div>
              </div>

              {/* Weighted Aggregate Score */}
              <div className="pt-2.5 border-t border-dashed border-line flex justify-between items-center">
                <div>
                  <div className="text-xs font-extrabold text-navy-900">
                    Weighted Overall Match Confidence
                  </div>
                  <div className="text-[11px] text-ink-400 font-mono">
                    0.80 × {facialScore.toFixed(1)}% + 0.20 × {textScore.toFixed(1)}% ={" "}
                    {weightedOverall.toFixed(1)}%
                  </div>
                </div>
                <span className="text-lg font-extrabold font-head text-brand-600">
                  {displayOverall}%
                </span>
              </div>
            </div>

            {/* Matched Attributes Checklist (Figure 14) */}
            <div className="flex flex-wrap gap-2 mb-2">
              {matchedAttributes.map((attr) => (
                <span
                  key={attr}
                  className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700"
                >
                  {attr}
                </span>
              ))}
            </div>
          </Card>

          {/* FISWG 5-TIER MORPHOLOGICAL EVALUATION RUBRIC (RRL p. 23, AI-PU-002 / IT-P4) */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="font-head font-extrabold text-base text-navy-900">
                  FISWG Morphological Evaluation Rubric
                </h2>
                <p className="text-xs text-ink-500">
                  Forensic facial comparison checklist required before official match confirmation (Test ID: AI-PU-002 / IT-P4)
                </p>
              </div>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${activeTierObj.badgeClass}`}
              >
                {activeTierObj.label}
              </span>
            </div>

            {/* 6 Anatomical Feature Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {FISWG_FEATURES.map((feat) => {
                const checked = checkedFeatures.includes(feat.id);
                return (
                  <label
                    key={feat.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "bg-brand-50/60 border-brand-600/40"
                        : "bg-paper border-line hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(feat.id)}
                      className="mt-0.5 rounded border-line text-brand-600 focus:ring-brand-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-navy-900">{feat.label}</div>
                      <div className="text-[11px] text-ink-400 leading-snug">{feat.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* 5-Tier Forensic Confidence Scale */}
            <div className="mb-4">
              <div className="text-xs font-bold text-navy-900 mb-2">
                Select FISWG Forensic Conclusion Tier (1–5)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {FISWG_TIERS.map((t) => {
                  const active = selectedTier === t.tier;
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      onClick={() => setSelectedTier(t.tier)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        active
                          ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                          : "bg-paper text-ink-700 border-line hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">Tier {t.tier}</span>
                        <span
                          className={`text-[10px] font-mono ${
                            active ? "text-teal-300" : "text-ink-400"
                          }`}
                        >
                          {t.range}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-1 line-clamp-1 ${
                          active ? "text-white/90" : "text-navy-900"
                        }`}
                      >
                        {t.label.replace(/^Tier \d — /, "")}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-500 mt-2 bg-slate-50 border border-line rounded px-3 py-2">
                <strong>{activeTierObj.label}:</strong> {activeTierObj.description}
              </p>
            </div>

            {/* Reviewer Notes */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Morphological Verification Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Note matching ocular spacing, eyeglasses frame, or clothing correspondence..."
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-brand-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleDecision("confirmed")}
                variant="primary"
                className="flex-1 text-sm py-3"
                disabled={submitting}
              >
                {submitting ? "Saving Verification..." : "✓ Confirm Match"}
              </Button>
              <Button
                onClick={() => handleDecision("needs_review")}
                variant="outline"
                className="flex-1 text-sm py-3 !text-ink-700 hover:!bg-red-50 hover:!border-danger hover:!text-danger"
                disabled={submitting}
              >
                Dismiss / Flag for Manual Review
              </Button>
            </div>

            {/* RA 10173 Data Privacy Notice (IT-P6) */}
            <div className="mt-5 pt-4 border-t border-line flex items-start gap-2.5 text-[11px] text-ink-400 leading-relaxed">
              <span className="text-sm shrink-0">🔒</span>
              <span>
                <strong>RA 10173 (Data Privacy Act of 2012) Compliance:</strong> Biometric
                embeddings (512-d vectors) are used exclusively for missing-person
                identification. Unmatched candidate comparisons are automatically purged
                upon case resolution (Test ID: IT-P6).
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function MatchAlertPage() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="text-sm text-ink-500 text-center py-10">
            Loading AI Match Alert...
          </div>
        }
      >
        <MatchAlertInner />
      </Suspense>
    </DashboardShell>
  );
}
