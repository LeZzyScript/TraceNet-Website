import assert from "node:assert/strict";
import {
  computeWeightedMatch,
  computeTextSimilarity,
  cosineSimilarityPct,
  extractCanonicalTokens,
  rankCandidatesForReport,
  recommendFiswgTier,
  FISWG_TIERS,
  FISWG_FEATURES,
} from "../lib/aiMatcher.js";

console.log("Running Phase 2 (80/20 AI Matcher & FISWG Rubric) unit tests...");

// 1. Verify 80/20 weighted formula on Manuscript Maria Santos pair
const mariaMissing = {
  id: "2038",
  type: "missing",
  name: "Maria Santos",
  age: 34,
  sex: "Female",
  location: "Brgy. Labangon, Cebu City",
  description: "White blouse, blue jeans, wearing eyeglasses",
};
const maboloSighting = {
  id: "s-101",
  type: "sighting",
  name: "Unidentified F.",
  age: 34,
  sex: "Female",
  location: "Brgy. Mabolo, Cebu City",
  description: "Disoriented, wearing white blouse, blue jeans, eyeglasses",
};

const demoMatch = computeWeightedMatch(mariaMissing, maboloSighting);
assert.equal(demoMatch.facialScore, 88.5, "Facial score should be 88.5%");
assert.equal(demoMatch.textScore, 85.2, "Text score should be 85.2%");
assert.equal(
  demoMatch.overallConfidence,
  Math.round((0.8 * 88.5 + 0.2 * 85.2) * 10) / 10,
  "Overall confidence must equal 0.80 * facial + 0.20 * text"
);
assert.equal(demoMatch.fiswgRecommendedTier, 4, "87.8% should recommend FISWG Tier 4");

// 2. Multilingual Cebuano/Tagalog/English token normalization
const tokensA = extractCanonicalTokens("Wearing puti sinina, asul maong karsones, antipara");
const tokensB = extractCanonicalTokens("White blouse, blue jeans, eyeglasses");
for (const expected of ["white", "blouse", "blue", "jeans", "eyeglasses"]) {
  assert.ok(tokensA.has(expected), `Cebuano/Tagalog token should map to ${expected}`);
  assert.ok(tokensB.has(expected), `English token should include ${expected}`);
}

// 3. Text similarity with Cebuano description vs English description
const cebuanoSighting = {
  id: "s-102",
  type: "sighting",
  name: "Babaye nakit-an",
  age: 35,
  sex: "Female",
  location: "Brgy. Tisa, Cebu City",
  description: "Nagsuot ug puti nga sinina, maong karsones, ug antipara, naglibog",
};
const textRes = computeTextSimilarity(mariaMissing, cebuanoSighting);
assert.ok(textRes.textScore >= 80, `Expected high multilingual text similarity, got ${textRes.textScore}`);
assert.ok(textRes.sharedKeywords.includes("white"));
assert.ok(textRes.sharedKeywords.includes("jeans"));
assert.ok(textRes.sharedKeywords.includes("eyeglasses"));

// 4. 512-d Cosine similarity check
const vec1 = Array.from({ length: 512 }, (_, i) => Math.sin(i));
const vec2 = Array.from({ length: 512 }, (_, i) => Math.sin(i));
assert.equal(cosineSimilarityPct(vec1, vec2), 100, "Identical 512-d vectors should be 100%");

// 5. FISWG 5-tier scale & 6 anatomical features
assert.equal(FISWG_TIERS.length, 5, "Must have 5 FISWG tiers");
assert.equal(FISWG_FEATURES.length, 6, "Must have 6 FISWG anatomical feature groups");
assert.equal(recommendFiswgTier(93).tier, 5);
assert.equal(recommendFiswgTier(82).tier, 4);
assert.equal(recommendFiswgTier(68).tier, 3);
assert.equal(recommendFiswgTier(45).tier, 2);
assert.equal(recommendFiswgTier(20).tier, 1);

// 6. Candidate ranking
const ranked = rankCandidatesForReport(mariaMissing, [
  maboloSighting,
  cebuanoSighting,
  {
    id: "s-male",
    type: "sighting",
    name: "Male person",
    age: 65,
    sex: "Male",
    location: "Brgy. Talamban",
    description: "Red jacket",
  },
]);
assert.equal(ranked.length, 2, "Incompatible male candidate should be filtered out (<55%)");
assert.equal(ranked[0].sightingReportId, "s-101");

// 7. Phase 3 Geo & Hotspot checks
import { filterNearbyCases, computeHotspots } from "../lib/geo.js";
const nearby = filterNearbyCases(10.308, 123.875, [mariaMissing, maboloSighting, cebuanoSighting], 2);
assert.equal(nearby.length, 2, "Only Labangon (0km) and Tisa (0.9km) are within 2km of Labangon");
const hotspots = computeHotspots([mariaMissing, maboloSighting, cebuanoSighting]);
assert.equal(hotspots.length, 3, "Three distinct barangays should produce 3 hotspot entries");

console.log("✓ All Phase 2 & Phase 3 unit tests passed!");

