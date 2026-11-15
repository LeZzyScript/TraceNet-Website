
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

export function subscribeReports(onData, onError) {
  return onSnapshot(
    collection(requireDb(), "reports"),
    (snap) => onData(sortNewestFirst(snap.docs.map((d) => normalizeReport(d.id, d.data())))),
    onError
  );
}

export function subscribeMatches(onData, onError) {
  return onSnapshot(
    collection(requireDb(), "matches"),
    (snap) => onData(snap.docs.map((d) => normalizeMatch(d.id, d.data()))),
    onError
  );
}

export function approveReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.VERIFIED,
    flagged: false,
    verifiedAt: serverTimestamp(),
    verifiedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

export function flagReport(reportId, reason, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    flagged: true,
    flagReason: reason || "Flagged by barangay official",
    ...actorFields(actor),
  });
}

export function forwardReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.FORWARDED,
    forwardedAt: serverTimestamp(),
    forwardedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

export function resolveReport(reportId, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.RESOLVED,
    resolvedAt: serverTimestamp(),
    resolvedByUid: actor?.uid || null,
    ...actorFields(actor),
  });
}

export function updateReportDetails(reportId, patch, actor) {
  const safePatch = {};
  for (const [k, v] of Object.entries(patch || {})) {
    if (v !== undefined) safePatch[k] = v;
  }
  return updateDoc(doc(requireDb(), "reports", reportId), {
    ...safePatch,
    ...actorFields(actor),
  });
}

export function cancelReportWithReason(reportId, reason, actor) {
  return updateDoc(doc(requireDb(), "reports", reportId), {
    status: REPORT_STATUS.RESOLVED,
    cancelled: true,
    cancelReason: reason || "Withdrawn by reporting citizen",
    resolvedAt: serverTimestamp(),
    ...actorFields(actor),
  });
}

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

