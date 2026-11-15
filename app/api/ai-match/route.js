import { NextResponse } from "next/server";
import {
  computeWeightedMatch,
  rankCandidatesForReport,
  FISWG_TIERS,
  FISWG_FEATURES,
} from "@/lib/aiMatcher";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

async function tryFastApiMatch(missingReport, sightingReport) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`${AI_SERVICE_URL}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missingReport, sightingReport }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    formula: "Overall = 0.80 * FacialScore + 0.20 * TextScore",
    weights: { facial: 0.8, text: 0.2 },
    fiswgTiers: FISWG_TIERS,
    fiswgFeatures: FISWG_FEATURES,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.targetReport && Array.isArray(body.candidateReports)) {
      const minConfidence = typeof body.minConfidence === "number" ? body.minConfidence : 55;
      const matches = rankCandidatesForReport(
        body.targetReport,
        body.candidateReports,
        minConfidence
      );
      return NextResponse.json({
        success: true,
        count: matches.length,
        matches,
      });
    }

    const { missingReport, sightingReport } = body;
    if (!missingReport || !sightingReport) {
      return NextResponse.json(
        { error: "Provide { missingReport, sightingReport } or { targetReport, candidateReports }" },
        { status: 400 }
      );
    }

    const fastApiResult = await tryFastApiMatch(missingReport, sightingReport);
    if (fastApiResult) {
      return NextResponse.json({
        success: true,
        result: fastApiResult,
      });
    }

    const fallbackResult = computeWeightedMatch(missingReport, sightingReport);
    return NextResponse.json({
      success: true,
      result: {
        ...fallbackResult,
        engine: "nextjs-80-20-engine",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "AI matching failed" },
      { status: 500 }
    );
  }
}

