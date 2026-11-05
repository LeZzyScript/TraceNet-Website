// Firestore read/write operations for the web portals. Everything here talks
// to the SAME collections the mobile app uses, with the same field names, so a
// change made on one platform shows up on the other immediately.

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  MATCH_STATUS,
  REPORT_STATUS,
  normalizeMatch,
  normalizeReport,
  sortNewestFirst,
} from "./reportMapper.js";
import { rankCandidatesForReport } from "./aiMatcher.js";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured for this deployment.");
  return db;
}

function actorFields(actor) {
  return {
    updatedAt: serverTimestamp(),
    updatedByUid: actor?.uid || null,
    updatedByName: actor?.name || null,
  };
}

// ------------------------------------------------------------ subscriptions

/** Live list of all reports (missing + sighting), newest first. */
export function subscribeReports(onData, onError) {
  return onSnapshot(
    collection(requireDb(), "reports"),
    (snap) => onData(sortNewestFirst(snap.docs.map((d) => normalizeReport(d.id, d.data())))),
    onError
  );
}

/** Live list of AI matches. */
export function subscribeMatches(onData, onError) {
  return onSnapshot(
    collection(requireDb(), "matches"),
    (snap) => onData(snap.docs.map((d) => normalizeMatch(d.id, d.data()))),
    onError
  );
}

// -------------------------------------------------------- official actions

/**
 * Barangay "Approve": submitted -> verified. The mobile tracker shows
 * "Verified by Barangay" + "AI Matching In Progress" for this status.
 */
export function approveReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.VERIFIED,
    flagged: false,
    verifiedAt: serverTimestamp(),
    verifiedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

/** Barangay "Flag": keeps the status, marks the report for follow-up. */
export function flagReport(reportId, reason, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    flagged: true,
    flagReason: reason || "Flagged by barangay official",
    ...actorFields(actor),
  });
}

/** Barangay "Forward to CCPO" / CCPO escalation: -> forwarded. */
export function forwardReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.FORWARDED,
    forwardedAt: serverTimestamp(),
    forwardedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

/** CCPO "Mark Resolved": -> resolved. */
export function resolveReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.RESOLVED,
    resolvedAt: serverTimestamp(),
    resolvedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

/**
 * Confirm / dismiss an AI match. Field names mirror what the mobile app
 * writes in app/match-alert.js. "Dismiss" uses 'needs_review' because that is
 * the only non-confirmed state the mobile UI knows how to render.
 */
export function reviewMatch(matchId, decision, actor, rubric = null) {
  const status =
    decision === "confirmed" ? MATCH_STATUS.CONFIRMED : MATCH_STATUS.NEEDS_REVIEW;
  const payload = {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: actor?.uid || null,
  };
  if (rubric) {
    if (typeof rubric.fiswgTier === "number") payload.fiswgTier = rubric.fiswgTier;
    if (Array.isArray(rubric.fiswgFeatures)) payload.fiswgFeatures = rubric.fiswgFeatures;
    if (typeof rubric.reviewerNotes === "string") payload.reviewerNotes = rubric.reviewerNotes;
  }
  return updateDoc(doc(requireDb(), "matches", matchId), payload);
}

/**
 * Run 80/20 AI candidate scan across all active opposite-type reports and
 * persist new candidate matches into Firestore `matches/{id}`.
 */
export async function runAiScanAndPersistMatches(
  targetReport,
  allReports = [],
  existingMatches = [],
  minConfidence = 60
) {
  if (!targetReport) return [];
  const candidates = rankCandidatesForReport(targetReport, allReports, minConfidence);
  const existingKeys = new Set(
    existingMatches.map((m) => `${m.missingReportId}|${m.sightingReportId}`)
  );

  const created = [];
  for (const cand of candidates) {
    const pairKey = `${cand.missingReportId}|${cand.sightingReportId}`;
    if (!cand.missingReportId || !cand.sightingReportId || existingKeys.has(pairKey)) {
      continue;
    }
    const docRef = await addDoc(collection(requireDb(), "matches"), {
      missingReportId: cand.missingReportId,
      sightingReportId: cand.sightingReportId,
      confidence: cand.confidence,
      facialScore: cand.facialScore,
      textScore: cand.textScore,
      matchedAttributes: cand.matchedAttributes,
      fiswgTier: cand.fiswgRecommendedTier,
      status: MATCH_STATUS.PENDING,
      createdAt: serverTimestamp(),
    });
    existingKeys.add(pairKey);
    created.push({ id: docRef.id, ...cand });
  }
  return created;
}

// ---------------------------------------------------------- citizen submit

/**
 * Create a report in the same shape the mobile app writes, so it appears in
 * the mobile app and in the barangay/CCPO dashboards. Web-only extras
 * (contact, relationship, ...) are additive; mobile ignores unknown fields.
 */
export async function submitWebReport(input, user) {
  if (!user?.uid) throw new Error("You must be signed in to submit a report.");

  const payload = {
    type: input.type === "sighting" ? "sighting" : "missing",
    name: input.name || "Unidentified person",
    age: input.age !== "" && input.age != null ? Number(input.age) : null,
    sex: input.sex || "Female",
    location: input.location,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    description: input.description || "",
    photoUrl: input.photoUrl || null,
    reportedByUid: user.uid,
    reportedByName: user.displayName || input.reporterName || "Unknown",
    status: REPORT_STATUS.SUBMITTED,
    flagged: false,
    createdAt: serverTimestamp(),
    // additive, web-originated
    source: "web",
    contactNumber: input.contactNumber || "",
    relationship: input.relationship || "",
    dateMissing: input.dateMissing || "",
    timeMissing: input.timeMissing || "",
    circumstances: input.circumstances || "",
  };
  if (input.barangay) payload.barangay = input.barangay;

  const ref = await addDoc(collection(requireDb(), "reports"), payload);
  return { id: ref.id };
}

