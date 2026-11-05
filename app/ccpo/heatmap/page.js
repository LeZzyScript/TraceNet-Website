"use client";

import { useMemo, useState } from "react";
import CCPOShell from "@/components/CCPOShell";
import DataModeBanner from "@/components/DataModeBanner";
import { useLiveCases } from "@/lib/useLiveCases";
import { computeHotspots } from "@/lib/geo";

const hotspotsByPeriod = {
  month: [
    { name: "Labangon", cases: 12, percent: 100, color: "bg-rose-600", badge: "High Priority" },
    { name: "Mabolo", cases: 6, percent: 55, color: "bg-orange-500", badge: "Medium" },
    { name: "Guadalupe", cases: 4, percent: 38, color: "bg-amber-500", badge: "Medium" },
    { name: "Pardo", cases: 3, percent: 28, color: "bg-yellow-500", badge: "Low" },
    { name: "Talamban", cases: 2, percent: 18, color: "bg-emerald-500", badge: "Low" },
  ],
  quarter: [
    { name: "Labangon", cases: 28, percent: 100, color: "bg-rose-600", badge: "High Priority" },
    { name: "Mabolo", cases: 19, percent: 68, color: "bg-orange-500", badge: "Medium" },
    { name: "Guadalupe", cases: 14, percent: 50, color: "bg-amber-500", badge: "Medium" },
    { name: "Pardo", cases: 9, percent: 32, color: "bg-yellow-500", badge: "Low" },
    { name: "Talamban", cases: 6, percent: 21, color: "bg-emerald-500", badge: "Low" },
  ],
  all: [
    { name: "Labangon", cases: 64, percent: 100, color: "bg-rose-600", badge: "High Priority" },
    { name: "Mabolo", cases: 42, percent: 66, color: "bg-orange-500", badge: "Medium" },
    { name: "Guadalupe", cases: 31, percent: 48, color: "bg-amber-500", badge: "Medium" },
    { name: "Pardo", cases: 22, percent: 34, color: "bg-yellow-500", badge: "Low" },
    { name: "Talamban", cases: 15, percent: 23, color: "bg-emerald-500", badge: "Low" },
  ],
};

export default function CCPOHeatmapPage() {
  const { live, loading, error, configured, authLoading, allReports, matches } =
    useLiveCases(["ccpo_officer", "admin"]);
  const [period, setPeriod] = useState("month");
  const [showOsmTiles, setShowOsmTiles] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState({
    name: "Labangon",
    count: 12,
    level: "High (10+)",
    coords: "10.3012° N, 123.8819° E",
  });
  const [exported, setExported] = useState(false);

  const liveHotspots = useMemo(() => {
    if (!live || !allReports.length) return null;
    const computed = computeHotspots(allReports);
    return computed.length ? computed.slice(0, 6) : null;
  }, [live, allReports]);

  const hotspots = liveHotspots || hotspotsByPeriod[period];

  function handleExport() {
    // Generate and download CSV report (Test ID: IT-P2)
    try {
      const rows = [
        ["Barangay", "Reported Cases", "Density Tier", "Period"],
        ...hotspots.map((h) => [
          `Brgy. ${h.name}`,
          String(h.cases),
          h.badge || "Active",
          period.toUpperCase(),
        ]),
      ];
      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `TraceNet-CCPO-Heatmap-${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback notification only
    }
    setExported(true);
    setTimeout(() => setExported(false), 3500);
  }

  return (
    <CCPOShell title="Heatmap & Analytics — Cebu City">
      <DataModeBanner
        live={live}
        loading={loading}
        error={error}
        configured={configured}
        authLoading={authLoading}
        loginHref="/ccpo/login"
      />
      {exported && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2240] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-[#1967D2]">
          📊 Heatmap Analytics Report (.csv) exported for CCPO Command!
        </div>
      )}

      {/* Top Filter Bar (Figure 26 p. 89) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 px-2">Period:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "month", label: "This Month" },
              { id: "quarter", label: "Quarter" },
              { id: "all", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === t.id
                    ? "bg-[#1967D2] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 px-2">
          <button
            type="button"
            onClick={() => setShowOsmTiles((v) => !v)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0B2240] cursor-pointer"
          >
            {showOsmTiles ? "🎯 Tactical Radar View" : "🗺️ OpenStreetMap Layer"}
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cebu City 80 Barangays</span>
          </span>
        </div>
      </div>

      {/* Main Grid (Figure 26 p. 89) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tactical Cluster Heatmap Canvas of Cebu City */}
        <div className="lg:col-span-2 bg-[#E8EEF5] border border-slate-200/90 rounded-2xl p-5 relative min-h-[420px] sm:min-h-[460px] flex items-center justify-center overflow-hidden shadow-xs">
          {showOsmTiles && (
            <iframe
              title="CCPO Cebu City OpenStreetMap Layer"
              src="https://www.openstreetmap.org/export/embed.html?bbox=123.8400%2C10.2700%2C123.9350%2C10.3700&layer=mapnik"
              className="absolute inset-0 w-full h-full opacity-75 pointer-events-none"
            />
          )}
          {/* Subtle Map Grid & Road Vectors */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
             xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gis-grid)" />
            {/* Stylized Cebu City Highway & Coastal Vectors */}
            <path
              d="M 40 380 Q 220 260 360 180 T 680 60"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <path
              d="M 180 40 Q 290 190 340 320 T 460 440"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />
          </svg>

          {/* Concentric Radar Rings matching Figure 26 */}
          <div className="relative w-[290px] h-[290px] sm:w-[350px] sm:h-[350px] rounded-full border border-slate-300/90 flex items-center justify-center">
            <div className="w-[210px] h-[210px] sm:w-[250px] sm:h-[250px] rounded-full border border-slate-300/90 flex items-center justify-center">
              <div className="w-[125px] h-[125px] sm:w-[150px] sm:h-[150px] rounded-full border border-slate-300/90 bg-white/20 backdrop-blur-[1px]" />
            </div>
          </div>

          {/* Header Badge Inside Map */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-3.5 py-2 shadow-xs">
            <div className="text-xs font-extrabold text-[#0B2240]">
              Cebu City — 80 Barangays
            </div>
            <div className="text-[10px] text-slate-400">
              Click any hotspot cluster pin to inspect jurisdiction
            </div>
          </div>

          {/* Red High-Concentration Cluster (12 — Labangon) */}
          <button
            type="button"
            onClick={() =>
              setSelectedBarangay({
                name: "Labangon",
                count: 12,
                level: "High (10+)",
                coords: "10.3012° N, 123.8819° E",
              })
            }
            className="absolute top-[33%] left-[34%] w-24 h-24 rounded-full bg-rose-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer group"
          >
            <span className="absolute w-16 h-16 rounded-full bg-rose-500/25 animate-ping" />
            <span className="relative w-10 h-10 rounded-full bg-rose-600 border-2 border-white text-white text-xs font-extrabold flex items-center justify-center shadow-lg">
              12
            </span>
          </button>

          {/* Orange Medium Cluster (6 — Mabolo) */}
          <button
            type="button"
            onClick={() =>
              setSelectedBarangay({
                name: "Mabolo",
                count: 6,
                level: "Medium (4–9)",
                coords: "10.3221° N, 123.9102° E",
              })
            }
            className="absolute top-[40%] left-[56%] w-18 h-18 rounded-full bg-orange-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-orange-600 border-2 border-white text-white text-xs font-extrabold flex items-center justify-center shadow-md">
              6
            </span>
          </button>

          {/* Amber Medium Cluster (4 — Guadalupe) */}
          <button
            type="button"
            onClick={() =>
              setSelectedBarangay({
                name: "Guadalupe",
                count: 4,
                level: "Medium (4–9)",
                coords: "10.3268° N, 123.8831° E",
              })
            }
            className="absolute top-[55%] left-[43%] w-16 h-16 rounded-full bg-amber-500/35 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-amber-600 border-2 border-white text-white text-xs font-extrabold flex items-center justify-center shadow-md">
              4
            </span>
          </button>

          {/* Green Lower Activity Zones (Pardo 3 & Talamban 2) */}
          <button
            type="button"
            onClick={() =>
              setSelectedBarangay({
                name: "Pardo",
                count: 3,
                level: "Low (1–3)",
                coords: "10.2804° N, 123.8547° E",
              })
            }
            className="absolute top-[24%] left-[60%] w-11 h-11 rounded-full bg-emerald-500/35 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white text-[10px] font-extrabold flex items-center justify-center shadow">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedBarangay({
                name: "Talamban",
                count: 2,
                level: "Low (1–3)",
                coords: "10.3694° N, 123.9158° E",
              })
            }
            className="absolute top-[63%] left-[64%] w-11 h-11 rounded-full bg-emerald-500/35 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white text-[10px] font-extrabold flex items-center justify-center shadow">
              2
            </span>
          </button>

          {/* Selected Barangay Floating Inspector Card */}
          {selectedBarangay && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 text-xs shadow-lg max-w-[230px]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-extrabold text-[#0B2240]">
                  📍 Brgy. {selectedBarangay.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1967D2]">
                  {selectedBarangay.count} Cases
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Density Tier: <strong className="text-slate-700">{selectedBarangay.level}</strong>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {selectedBarangay.coords}
              </div>
            </div>
          )}

          {/* Legend Box at Bottom Left (Exact Figure 26 p. 89) */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3.5 py-2.5 text-[11px] text-slate-700 space-y-1.5 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Hotspot Legend
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>High (10+)</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Medium (4–9)</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Low (1–3)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Top Hotspot Barangays + Case Summary + Export Button (Figure 26 p. 89) */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Top Hotspot Barangays Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#0B2240] mb-1">
              Top Hotspot Barangays
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Ranked by missing person report frequency
            </p>
            <div className="space-y-3.5">
              {hotspots.map((h) => (
                <div key={h.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700">Brgy. {h.name}</span>
                    <span className="font-extrabold text-[#0B2240]">{h.cases} cases</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${h.color} rounded-full transition-all duration-300`}
                      style={{ width: `${h.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Summary Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#0B2240] mb-3">
              Case Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Active cases</span>
                <span className="font-extrabold text-sm text-[#0B2240]">48</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">AI matches</span>
                <span className="font-extrabold text-sm text-[#1967D2]">11</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Barangays</span>
                <span className="font-extrabold text-sm text-emerald-600">23</span>
              </div>
            </div>
          </div>

          {/* Export Heatmap Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-3 rounded-xl bg-[#1967D2] hover:bg-[#1454B0] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📊</span> Export Heatmap Report
          </button>
        </div>
      </div>
    </CCPOShell>
  );
}
