// Unit checks for lib/reportMapper.js + lib/geo.js using the exact document
// shapes written by tracenet-mobile. Run: node scripts/test-mapper.mjs
import assert from "node:assert/strict";
import {
  normalizeReport, normalizeMatch, bestMatchByReport, toBarangayRow, toCcpoRow,
  barangayMetrics, ccpoMetrics, normalizeRole, relativeTime, initialsOf, shortId,
} from "../lib/reportMapper.js";
import { inferBarangay } from "../lib/geo.js";

const NOW = Date.UTC(2026, 5, 28, 12, 0, 0);
const ts = (minsAgo) => ({ toDate: () => new Date(NOW - minsAgo * 60000) });

let passed = 0;
function check(name, fn) { fn(); passed++; console.log("ok -", name); }

// ---- documents exactly as mobile report.js writes them
const mobileMissing = {
  type: "missing", name: "Maria Santos", age: 34, sex: "Female",
  location: "Brgy. Labangon public market", latitude: null, longitude: null,
  description: "White blouse, blue jeans", photoUrl: "https://res.cloudinary.com/x.jpg",
  reportedByUid: "uid1", reportedByName: "Juan dela Cruz",
  status: "submitted", flagged: false, createdAt: ts(180),
};
const mobileSighting = {
  type: "sighting", name: "Unidentified person", age: null, sex: "Female",
  location: "Mabolo", latitude: 10.321, longitude: 123.921,
  description: "", photoUrl: null, reportedByUid: "uid2", reportedByName: "Unknown",
  status: "submitted", flagged: false, createdAt: ts(30),
};

check("normalizeReport keeps mobile fields and mirrors mobile short id", () => {
  const r = normalizeReport("AbCdEfGh123", mobileMissing);
  assert.equal(r.shortId, "#AbCdEf");
  assert.equal(r.shortId, shortId("AbCdEfGh123"));
  assert.equal(r.name, "Maria Santos");
  assert.equal(r.age, 34);
  assert.equal(r.status, "submitted");
  assert.equal(r.type, "missing");
  assert.equal(r.reporterUid, "uid1");
});

check("normalizeReport tolerates missing/unknown fields", () => {
  const r = normalizeReport("x1", { status: "weird" });
  assert.equal(r.status, "submitted");
  assert.equal(r.name, "Unidentified person");
  assert.equal(r.age, null);
  assert.equal(r.createdAt, null);
  assert.equal(r.flagged, false);
});

check("barangay inferred from text, then from coordinates, else Unassigned", () => {
  assert.equal(inferBarangay({ location: "Brgy. Labangon public market" }), "Labangon");
  assert.equal(inferBarangay({ location: "somewhere", latitude: 10.321, longitude: 123.921 }), "Mabolo");
  assert.equal(inferBarangay({ location: "Cebu City" }), "Unassigned");
  // far outside Cebu -> must not be force-assigned to the nearest centroid
  assert.equal(inferBarangay({ location: "x", latitude: 14.6, longitude: 121.0 }), "Unassigned");
});

check("normalizeMatch: confidence rounded, optional scores never become 0", () => {
  const m = normalizeMatch("m1", { missingReportId: "a", sightingReportId: "b", confidence: 87.4, status: "pending" });
  assert.equal(m.confidence, 87);
  assert.equal(m.facialScore, null);
  assert.equal(m.textScore, null);
  const m2 = normalizeMatch("m2", { confidence: 90, facialScore: null, textScore: 0 });
  assert.equal(m2.facialScore, null);
  assert.equal(m2.textScore, 0);
});

check("bestMatchByReport prefers pending, then higher confidence", () => {
  const ms = [
    normalizeMatch("a", { missingReportId: "r1", confidence: 95, status: "confirmed" }),
    normalizeMatch("b", { missingReportId: "r1", confidence: 70, status: "pending" }),
    normalizeMatch("c", { missingReportId: "r1", confidence: 80, status: "pending" }),
  ];
  assert.equal(bestMatchByReport(ms).get("r1").id, "c");
});

check("barangay row: New / Match / Verified / Escalated / Flagged / Resolved", () => {
  const base = normalizeReport("r1AAAA", mobileMissing);
  const pend = normalizeMatch("m1", { missingReportId: "r1AAAA", confidence: 87, status: "pending" });
  assert.equal(toBarangayRow(base, null).status, "New");
  assert.equal(toBarangayRow(base, null).score, "Pend.");
  const m = toBarangayRow(base, pend);
  assert.equal(m.status, "Match"); assert.equal(m.score, "87%"); assert.equal(m.scoreNum, 87);
  assert.equal(toBarangayRow({ ...base, status: "verified" }, null).status, "Verified");
  assert.equal(toBarangayRow({ ...base, status: "forwarded" }, pend).status, "Escalated");
  assert.equal(toBarangayRow({ ...base, flagged: true }, pend).status, "Flagged");
  assert.equal(toBarangayRow({ ...base, status: "resolved" }, pend).status, "Resolved");
  assert.equal(toBarangayRow(base, null).docId, "r1AAAA");
});

check("ccpo row categories drive tabs", () => {
  const base = normalizeReport("r2BBBB", mobileMissing);
  assert.equal(toCcpoRow(base, null).category, "active");
  assert.equal(toCcpoRow({ ...base, status: "forwarded" }, null).category, "escalated");
  assert.equal(toCcpoRow({ ...base, status: "resolved" }, null).category, "resolved");
  assert.equal(toCcpoRow(base, null).officer, "Unassigned");
});

check("metrics are computed from rows (no hard-coded numbers)", () => {
  const reports = [
    normalizeReport("a1", { ...mobileMissing, status: "submitted" }),
    normalizeReport("a2", { ...mobileMissing, status: "verified" }),
    normalizeReport("a3", { ...mobileMissing, status: "forwarded" }),
    normalizeReport("a4", { ...mobileMissing, status: "resolved" }),
  ];
  const matches = [normalizeMatch("m", { missingReportId: "a2", confidence: 88, status: "pending" })];
  const best = bestMatchByReport(matches);
  const bm = barangayMetrics(reports.map((r) => toBarangayRow(r, best.get(r.id))));
  assert.deepEqual(bm, { active: 3, aiMatches: 1, pendingVerify: 1, escalated: 1 });
  const cm = ccpoMetrics(reports.map((r) => toCcpoRow(r, best.get(r.id))));
  assert.deepEqual(cm, { active: 3, aiMatchesPending: 1, escalated: 1, resolved: 1 });
});

check("roles map to the Postgres user_role_type names", () => {
  assert.equal(normalizeRole("Citizen / Family Member"), "citizen");
  assert.equal(normalizeRole("barangay_official"), "barangay_official");
  assert.equal(normalizeRole("ccpo_officer"), "ccpo_officer");
  assert.equal(normalizeRole("admin"), "admin");
  assert.equal(normalizeRole(undefined), "citizen");
});

check("relativeTime + initials", () => {
  assert.equal(relativeTime(ts(0), NOW), "Just now");
  assert.equal(relativeTime(ts(45), NOW), "45 min ago");
  assert.equal(relativeTime(ts(60), NOW), "1 hr ago");
  assert.equal(relativeTime(ts(180), NOW), "3 hrs ago");
  assert.equal(relativeTime(ts(60 * 24), NOW), "Yesterday");
  assert.equal(relativeTime(null, NOW), "Just now");
  assert.equal(initialsOf("Maria Santos"), "MS");
  assert.equal(initialsOf("Unidentified"), "UN");
  assert.equal(initialsOf(""), "?");
});

console.log(`\n${passed} checks passed`);

