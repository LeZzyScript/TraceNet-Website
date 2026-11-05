"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useLiveCases } from "@/lib/useLiveCases";
import {
  BARANGAY_CENTROIDS,
  filterNearbyCases,
  getBarangayCoords,
} from "@/lib/geo";

const DEMO_MAP_REPORTS = [
  {
    id: "demo-2038",
    caseCode: "#2038",
    type: "missing",
    name: "Maria Santos",
    age: 34,
    sex: "Female",
    barangay: "Labangon",
    location: "Brgy. Labangon Public Market, Cebu City",
    latitude: 10.308,
    longitude: 123.875,
    description: "White blouse, blue jeans, wearing eyeglasses",
    status: "verified",
  },
  {
    id: "demo-s101",
    caseCode: "#S101",
    type: "sighting",
    name: "Unidentified Female (Sighting)",
    age: 34,
    sex: "Female",
    barangay: "Mabolo",
    location: "Brgy. Mabolo Hall, Cebu City",
    latitude: 10.321,
    longitude: 123.921,
    description: "Disoriented, wearing white blouse, blue jeans, eyeglasses",
    status: "submitted",
  },
  {
    id: "demo-2041",
    caseCode: "#2041",
    type: "missing",
    name: "Liza Tan",
    age: 16,
    sex: "Female",
    barangay: "Lahug",
    location: "Near JY Square Mall, Brgy. Lahug",
    latitude: 10.334,
    longitude: 123.898,
    description: "Wearing school uniform, carrying black backpack",
    status: "submitted",
  },
  {
    id: "demo-2039",
    caseCode: "#2039",
    type: "missing",
    name: "Carlos Reyes",
    age: 67,
    sex: "Male",
    barangay: "Guadalupe",
    location: "Guadalupe Church Plaza, Cebu City",
    latitude: 10.3235,
    longitude: 123.8789,
    description: "Gray polo shirt, brown slippers, elderly with cane",
    status: "forwarded",
  },
  {
    id: "demo-2037",
    caseCode: "#2037",
    type: "missing",
    name: "Ana Lim",
    age: 9,
    sex: "Female",
    barangay: "Pardo",
    location: "Brgy. Pardo Elementary School",
    latitude: 10.289,
    longitude: 123.856,
    description: "Pink t-shirt, denim shorts",
    status: "verified",
  },
];

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1 },
  { label: "3 km", value: 3 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "All Cebu City", value: 0 },
];

const BOUNDS = {
  minLat: 10.265,
  maxLat: 10.375,
  minLng: 123.845,
  maxLng: 123.93,
};

function latLngToPercent(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

export default function SightingsMapPage() {
  const { live, allReports } = useLiveCases();
  const [centerBarangay, setCenterBarangay] = useState("Labangon");
  const [customCenter, setCustomCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPin, setSelectedPin] = useState(null);

  const centerCoords = useMemo(() => {
    if (customCenter) return customCenter;
    return getBarangayCoords(centerBarangay) || {
      latitude: 10.308,
      longitude: 123.875,
      name: "Labangon",
    };
  }, [customCenter, centerBarangay]);

  const sourceReports = useMemo(() => {
    if (live && allReports.length > 0) return allReports;
    return DEMO_MAP_REPORTS;
  }, [live, allReports]);

  const nearbyCases = useMemo(() => {
    const within = filterNearbyCases(
      centerCoords.latitude,
      centerCoords.longitude,
      sourceReports,
      radiusKm
    );
    if (typeFilter === "all") return within;
    return within.filter((r) => r.type === typeFilter);
  }, [centerCoords, sourceReports, radiusKm, typeFilter]);

  const activePin = selectedPin || nearbyCases[0] || null;

  function handleUseDeviceGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCustomCenter({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        name: "My GPS Location",
      });
    });
  }

  const bboxStr = `${(centerCoords.longitude - 0.032).toFixed(4)}%2C${(
    centerCoords.latitude - 0.024
  ).toFixed(4)}%2C${(centerCoords.longitude + 0.032).toFixed(4)}%2C${(
    centerCoords.latitude + 0.024
  ).toFixed(4)}`;

  return (
    <DashboardShell>
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-head font-extrabold text-2xl text-navy-900">
              Cebu City Sightings &amp; Nearby Cases Map
            </h1>
            <p className="text-sm text-ink-500">
              Objective 3: Pinned case locations, adjustable radius filter, and proximity alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseDeviceGps}
              className="px-3.5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold cursor-pointer"
            >
              📍 Center on My GPS
            </button>
            <Link
              href="/report-found"
              className="px-3.5 py-2 rounded-md bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold"
            >
              + Report Sighting
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-navy-900">Reference Barangay:</span>
            <select
              value={centerBarangay}
              onChange={(e) => {
                setCustomCenter(null);
                setCenterBarangay(e.target.value);
              }}
              className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-bold text-navy-900"
            >
              {BARANGAY_CENTROIDS.map((b) => (
                <option key={b.name} value={b.name}>
                  Brgy. {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-navy-900 mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setRadiusKm(opt.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-extrabold border cursor-pointer transition-colors ${
                  radiusKm === opt.value
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-paper text-ink-700 border-line hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All Pins" },
              { id: "missing", label: "🔴 Missing" },
              { id: "sighting", label: "🟢 Sightings" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer ${
                  typeFilter === t.id
                    ? "bg-navy-900 text-white border-navy-900"
                    : "bg-paper text-ink-700 border-line"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Interactive OpenStreetMap + Pin Layer */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-line bg-[#E4ECF5] min-h-[420px] shadow-xs">
            <iframe
              title="Cebu City Sightings OpenStreetMap"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bboxStr}&layer=mapnik&marker=${centerCoords.latitude}%2C${centerCoords.longitude}`}
              className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
            />

            {/* Top Overlay Badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-line rounded-lg px-3 py-2 shadow-xs z-10">
              <div className="text-xs font-extrabold text-navy-900">
                📍 Centered: {customCenter ? customCenter.name : `Brgy. ${centerBarangay}`}
              </div>
              <div className="text-[11px] text-ink-500">
                Showing <strong>{nearbyCases.length}</strong> case(s){" "}
                {radiusKm > 0 ? `within ${radiusKm} km` : "across Cebu City"}
              </div>
            </div>

            {/* Pinned Case Markers */}
            {nearbyCases.map((c) => {
              const pos = latLngToPercent(c.latitude, c.longitude);
              const isSighting = c.type === "sighting";
              const isSelected = activePin?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedPin(c)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform ${
                    isSelected ? "scale-125" : "hover:scale-110"
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-md flex items-center gap-1 whitespace-nowrap ${
                      isSighting ? "bg-teal-600" : "bg-rose-600"
                    }`}
                  >
                    <span>{isSighting ? "🟢" : "🔴"}</span>
                    <span>{c.name.split(" ")[0]}</span>
                    <span className="opacity-85">({c.distanceKm}km)</span>
                  </span>
                </button>
              );
            })}

            {/* Selected Pin Floating Detail Card */}
            {activePin && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md border border-line rounded-xl p-3.5 shadow-lg z-20 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      activePin.type === "sighting"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {activePin.type === "sighting" ? "Found / Sighting" : "Missing Person"}
                  </span>
                  <span className="font-mono font-bold text-brand-600">
                    {activePin.distanceKm} km away
                  </span>
                </div>
                <div className="font-bold text-sm text-navy-900">
                  {activePin.name} {activePin.age ? `(${activePin.age})` : ""}
                </div>
                <div className="text-ink-500 mt-0.5">{activePin.location}</div>
                <div className="text-ink-400 mt-1 line-clamp-2">{activePin.description}</div>
                <div className="mt-2.5 pt-2 border-t border-line flex items-center justify-between">
                  <Link
                    href={`/case-status?id=${activePin.id}`}
                    className="font-bold text-brand-600 hover:underline"
                  >
                    View Case Details →
                  </Link>
                  <Link
                    href="/match-alert"
                    className="font-bold text-[#0E8FA3] hover:underline"
                  >
                    80/20 AI Match
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Nearby Cases Distance List */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
              Nearby Cases ({nearbyCases.length})
            </div>
            {nearbyCases.length === 0 ? (
              <Card className="p-6 text-center text-xs text-ink-500">
                No cases found within {radiusKm} km of Brgy. {centerBarangay}. Try
                increasing the radius filter above.
              </Card>
            ) : (
              nearbyCases.map((c) => (
                <Card
                  key={c.id}
                  onClick={() => setSelectedPin(c)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    activePin?.id === c.id
                      ? "border-brand-600 ring-2 ring-brand-100"
                      : "hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-navy-900">
                        {c.name} {c.age ? `· ${c.age}` : ""}
                      </div>
                      <div className="text-[11px] text-ink-400 mt-0.5">{c.location}</div>
                    </div>
                    <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 shrink-0">
                      {c.distanceKm} km
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-600 mt-2 pt-2 border-t border-dashed border-line line-clamp-2">
                    {c.description || "No clothing description provided."}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

