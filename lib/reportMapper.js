// Pure mapping layer between the Firestore documents the mobile app writes
// (`reports`, `matches`) and the row shapes the web portals render.
//
// Mobile contract (see tracenet-mobile/app/(tabs)/report.js and
// backend-reference/MATCHES_SCHEMA.md):
//   reports/{id}: type 'missing'|'sighting', name, age, sex, location,
//     latitude, longitude, description, photoUrl, reportedByUid,
//     reportedByName, status 'submitted'|'verified'|'forwarded'|'resolved',
//     flagged, createdAt
//   matches/{id}: missingReportId, sightingReportId, confidence (0-100),
//     status 'pending'|'confirmed'|'needs_review', reviewedAt, reviewedBy
//
// No Firebase imports here on purpose, so this file is unit-testable in Node.

import { inferBarangay } from "./geo.js";

export const REPORT_STATUS = {
  SUBMITTED: "submitted",
  VERIFIED: "verified",
  FORWARDED: "forwarded",
  RESOLVED: "resolved",
};

export const MATCH_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  NEEDS_REVIEW: "needs_review",
};

// ---------------------------------------------------------------- utilities

/** Firestore Timestamp | Date | number | null -> Date | null */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "number") return new Date(value);
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
}

export function relativeTime(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "Just now";
  const diffMin = Math.max(0, Math.round((now - date.getTime()) / 60000));
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const hrs = Math.round(diffMin / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Same short id the mobile app shows: `Case #{id.slice(0, 6)}`. */
export function shortId(id) {
  return `#${String(id || "").slice(0, 6)}`;
}

// ----------------------------------------------------------- normalization

export function normalizeReport(id, data = {}) {
  const status = Object.values(REPORT_STATUS).includes(data.status)
    ? data.status
    : REPORT_STATUS.SUBMITTED;
  const latitude = typeof data.latitude === "number" ? data.latitude : null;
  const longitude = typeof data.longitude === "number" ? data.longitude : null;
  const location = data.location || "";

  return {
    id,
    shortId: shortId(id),
    caseCode: shortId(id),
    type: data.type === "sighting" ? "sighting" : "missing",
    name: data.name || "Unidentified person",
    age: typeof data.age === "number" ? data.age : null,
    sex: data.sex || "",
    location,
    latitude,
    longitude,
    barangay: data.barangay || inferBarangay({ location, latitude, longitude }),
    description: data.description || "",
    photoUrl: data.photoUrl || null,
    reporterUid: data.reportedByUid || null,
    reportedByUid: data.reportedByUid || null,
    reporterName: data.reportedByName || "Unknown",
    reportedByName: data.reportedByName || "Unknown",
    contactNumber: data.contactNumber || "",
    status,
    flagged: data.flagged === true,
    flagReason: data.flagReason || "",
    assignedOfficer: data.assignedOfficer || "",
    createdAt: toDate(data.createdAt),
  };
}

/** Optional numeric score: undefined/null/non-numeric -> null (never 0). */
function optionalScore(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
}

export function normalizeMatch(id, data = {}) {
  const confidence = Number(data.confidence);
  return {
    id,
    missingReportId: data.missingReportId || null,
    sightingReportId: data.sightingReportId || null,
    confidence: Number.isFinite(confidence) ? Math.round(confidence) : 0,
    facialScore: optionalScore(data.facialScore),
    textScore: optionalScore(data.textScore),
    matchedAttributes: Array.isArray(data.matchedAttributes) ? data.matchedAttributes : null,
    fiswgTier: typeof data.fiswgTier === "number" ? data.fiswgTier : null,
    fiswgFeatures: Array.isArray(data.fiswgFeatures) ? data.fiswgFeatures : [],
    reviewerNotes: data.reviewerNotes || "",
    status: Object.values(MATCH_STATUS).includes(data.status) ? data.status : MATCH_STATUS.PENDING,
    createdAt: toDate(data.createdAt),
  };
}

/** Highest-confidence match per missing report (pending matches win ties). */
export function bestMatchByReport(matches) {
  const map = new Map();
  for (const m of matches) {
    if (!m.missingReportId) continue;
    const current = map.get(m.missingReportId);
    const better =
      !current ||
      (m.status === MATCH_STATUS.PENDING && current.status !== MATCH_STATUS.PENDING) ||
      (m.status === current.status && m.confidence > current.confidence);
    if (better) map.set(m.missingReportId, m);
  }
  return map;
}

export function sortNewestFirst(reports) {
  return [...reports].sort(
    (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
  );
}

// --------------------------------------------------- Barangay dashboard rows

function ageGender(r) {
  return [r.age != null ? r.age : null, r.sex || null].filter((v) => v !== null).join(" · ") || "—";
}

/**
 * Row shape consumed by app/barangay/dashboard/page.js.
 * UI status: New | Match | Escalated | Verified | Resolved | Flagged
 */
export function toBarangayRow(report, match) {
  const hasPendingMatch = match && match.status === MATCH_STATUS.PENDING;
  let status = "New";
  if (report.flagged) status = "Flagged";
  else if (report.status === REPORT_STATUS.RESOLVED) status = "Resolved";
  else if (report.status === REPORT_STATUS.FORWARDED) status = "Escalated";
  else if (hasPendingMatch) status = "Match";
  else if (report.status === REPORT_STATUS.VERIFIED) status = "Verified";

  const scoreNum = match ? match.confidence : 0;
  const display = report.age != null ? `${report.name}, ${report.age}` : report.name;

  return {
    id: report.shortId,
    docId: report.id,
    matchId: match ? match.id : null,
    caseDisplayId: report.shortId,
    initials: initialsOf(report.name),
    name: display,
    personName: report.name,
    ageGender: ageGender(report),
    submitted: relativeTime(report.createdAt),
    status,
    score: scoreNum > 0 ? `${scoreNum}%` : status === "New" ? "Pend." : "—",
    scoreNum,
    facialScore: match?.facialScore ?? null,
    textScore: match?.textScore ?? null,
    lastSeen: report.location || "—",
    reporter: report.contactNumber
      ? `${report.reporterName} · ${report.contactNumber}`
      : report.reporterName,
    description: report.description ? `"${report.description}"` : "No description provided.",
    barangay: report.barangay === "Unassigned" ? "Unassigned" : `Brgy. ${report.barangay}`,
    photoUrl: report.photoUrl,
  };
}

export function barangayMetrics(rows) {
  return {
    active: rows.filter((r) => r.status !== "Resolved").length,
    aiMatches: rows.filter((r) => r.status === "Match").length,
    pendingVerify: rows.filter((r) => r.status === "New").length,
    escalated: rows.filter((r) => r.status === "Escalated").length,
  };
}

// ------------------------------------------------------------- CCPO rows

const BADGE = {
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  red: "bg-rose-50 text-rose-700 border border-rose-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
};

/**
 * Row shape consumed by app/ccpo/cases/page.js and app/ccpo/dashboard/page.js.
 * category: active | escalated | resolved
 */
export function toCcpoRow(report, match) {
  const hasPendingMatch = match && match.status === MATCH_STATUS.PENDING;
  const scoreNum = match ? match.confidence : 0;
  const display = report.age != null ? `${report.name}, ${report.age}` : report.name;

  let category = "active";
  let status = "Active";
  let statusBadge = BADGE.amber;
  if (report.status === REPORT_STATUS.RESOLVED) {
    category = "resolved";
    status = "✓ Resolved";
    statusBadge = BADGE.green;
  } else if (report.status === REPORT_STATUS.FORWARDED) {
    category = "escalated";
    status = "Escalated";
    statusBadge = BADGE.red;
  } else if (hasPendingMatch) {
    status = "● Match";
    statusBadge = BADGE.green;
  } else if (report.status === REPORT_STATUS.SUBMITTED) {
    status = "New";
  }

  return {
    id: report.shortId,
    docId: report.id,
    matchId: match ? match.id : null,
    initials: initialsOf(report.name),
    name: display,
    subtext: `Reported ${relativeTime(report.createdAt)}${report.sex ? ` · ${report.sex}` : ""}`,
    barangay: report.barangay,
    status,
    statusBadge,
    score: scoreNum > 0 ? `${scoreNum}%` : status === "New" ? "Pend." : "—",
    scoreNum,
    category,
    officer: report.assignedOfficer || "Unassigned",
    notes: report.description || "No description provided.",
    facialScore: match?.facialScore ?? null,
    textScore: match?.textScore ?? null,
    hasPendingMatch: Boolean(hasPendingMatch),
    photoUrl: report.photoUrl,
  };
}

export function ccpoMetrics(rows) {
  return {
    active: rows.filter((r) => r.category !== "resolved").length,
    aiMatchesPending: rows.filter((r) => r.hasPendingMatch).length,
    escalated: rows.filter((r) => r.category === "escalated").length,
    resolved: rows.filter((r) => r.category === "resolved").length,
  };
}

// ----------------------------------------------------------------- roles

/**
 * Roles are normalised to the same names as the Postgres `user_role_type`
 * enum in database/schema.sql. The mobile app currently writes the display
 * string 'Citizen / Family Member' for citizens.
 */
export function normalizeRole(raw) {
  const r = String(raw || "").toLowerCase();
  if (r.includes("admin")) return "admin";
  if (r.includes("ccpo") || r.includes("police")) return "ccpo_officer";
  if (r.includes("barangay")) return "barangay_official";
  return "citizen";
}
