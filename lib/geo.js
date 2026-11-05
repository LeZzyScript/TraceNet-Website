// Geo helpers shared by the live data layer.
//
// NOTE: Only a partial list of Cebu City barangay centroids is bundled here
// (same 8 used by the demo fallback in lib/db.js). The full 80-barangay list
// comes with the Phase 3 map work. Reports that cannot be matched to a known
// barangay are labelled "Unassigned" rather than guessed.

export const BARANGAY_CENTROIDS = [
  { name: "Labangon", latitude: 10.308, longitude: 123.875 },
  { name: "Mabolo", latitude: 10.321, longitude: 123.921 },
  { name: "Guadalupe", latitude: 10.3235, longitude: 123.8789 },
  { name: "Lahug", latitude: 10.334, longitude: 123.898 },
  { name: "Talamban", latitude: 10.368, longitude: 123.918 },
  { name: "Basak San Nicolas", latitude: 10.2995, longitude: 123.8724 },
  { name: "Pardo", latitude: 10.289, longitude: 123.856 },
  { name: "Apas", latitude: 10.337, longitude: 123.906 },
];

// A coordinate further than this from every known centroid is not assigned.
const MAX_ASSIGN_DISTANCE_KM = 3;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Best-effort barangay for a report. Order of precedence:
 *  1. A known barangay name mentioned in the free-text location
 *  2. The nearest known centroid within MAX_ASSIGN_DISTANCE_KM of the pin
 *  3. "Unassigned"
 */
export function inferBarangay({ location, latitude, longitude }) {
  const text = String(location || "").toLowerCase();
  const byName = BARANGAY_CENTROIDS.find((b) => text.includes(b.name.toLowerCase()));
  if (byName) return byName.name;

  if (typeof latitude === "number" && typeof longitude === "number") {
    let best = null;
    for (const b of BARANGAY_CENTROIDS) {
      const d = haversineKm(latitude, longitude, b.latitude, b.longitude);
      if (!best || d < best.d) best = { name: b.name, d };
    }
    if (best && best.d <= MAX_ASSIGN_DISTANCE_KM) return best.name;
  }
  return "Unassigned";
}

