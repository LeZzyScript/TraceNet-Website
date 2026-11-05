"use client";

import { useState } from "react";
import {
  BARANGAY_CENTROIDS,
  CEBU_CITY_CENTER,
  getBarangayCoords,
  inferBarangay,
} from "@/lib/geo";

// Bounding box of urban Cebu City for interactive click-to-coord mapping
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
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(4, Math.min(96, y)),
  };
}

export default function LocationPinPicker({
  latitude,
  longitude,
  barangay = "Labangon",
  onSelectLocation,
}) {
  const initialCoords =
    typeof latitude === "number" && typeof longitude === "number"
      ? { latitude, longitude }
      : getBarangayCoords(barangay) || {
          latitude: 10.308,
          longitude: 123.875,
        };

  const [pin, setPin] = useState(initialCoords);
  const [gpsStatus, setGpsStatus] = useState("");
  const [showOsmIframe, setShowOsmIframe] = useState(true);

  function applyCoords(lat, lng, explicitBrgy = null) {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    setPin({ latitude: roundedLat, longitude: roundedLng });

    const inferred =
      explicitBrgy ||
      inferBarangay({ latitude: roundedLat, longitude: roundedLng });
    const brgyName = inferred !== "Unassigned" ? inferred : barangay || "Labangon";
    if (onSelectLocation) {
      onSelectLocation({
        latitude: roundedLat,
        longitude: roundedLng,
        barangay: brgyName,
        locationText: `Brgy. ${brgyName}, Cebu City (${roundedLat.toFixed(4)}° N, ${roundedLng.toFixed(4)}° E)`,
      });
    }
  }

  function handleCanvasClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const lng = BOUNDS.minLng + relX * (BOUNDS.maxLng - BOUNDS.minLng);
    const lat = BOUNDS.maxLat - relY * (BOUNDS.maxLat - BOUNDS.minLat);
    applyCoords(lat, lng);
  }

  function handleUseGps() {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation is not supported by this browser.");
      return;
    }
    setGpsStatus("Detecting GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus("GPS pin locked!");
        applyCoords(pos.coords.latitude, pos.coords.longitude);
        setTimeout(() => setGpsStatus(""), 3000);
      },
      () => {
        setGpsStatus("Could not read device GPS — click map or choose barangay below.");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  const pinPos = latLngToPercent(pin.latitude, pin.longitude);
  const bboxStr = `${(pin.longitude - 0.018).toFixed(4)}%2C${(
    pin.latitude - 0.012
  ).toFixed(4)}%2C${(pin.longitude + 0.018).toFixed(4)}%2C${(
    pin.latitude + 0.012
  ).toFixed(4)}`;

  return (
    <div className="rounded-lg border border-line bg-slate-50/80 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-extrabold text-navy-900 flex items-center gap-1.5">
            <span>🗺️</span> Pin Exact Location on Cebu City Map (Objective 3 · IT-C7)
          </div>
          <div className="text-[11px] text-ink-400">
            Click anywhere on the map or select a barangay to drop a GPS pin
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUseGps}
            className="px-2.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            📍 Use Device GPS
          </button>
          <button
            type="button"
            onClick={() => setShowOsmIframe((v) => !v)}
            className="px-2.5 py-1.5 rounded-md bg-white border border-line text-ink-700 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer"
          >
            {showOsmIframe ? "Tactical Grid" : "OSM Street View"}
          </button>
        </div>
      </div>

      {gpsStatus && (
        <div className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1.5 rounded border border-brand-200">
          {gpsStatus}
        </div>
      )}

      {/* Interactive Pin-Drop Canvas with OpenStreetMap background */}
      <div
        onClick={handleCanvasClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCanvasClick(e);
        }}
        className="relative h-56 w-full rounded-lg overflow-hidden border border-slate-300 bg-[#E4ECF5] cursor-crosshair select-none"
      >
        {showOsmIframe && (
          <iframe
            title="Cebu City OpenStreetMap"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bboxStr}&layer=mapnik&marker=${pin.latitude}%2C${pin.longitude}`}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
          />
        )}

        {/* Clickable Barangay Reference Dots */}
        {BARANGAY_CENTROIDS.slice(0, 12).map((b) => {
          const pos = latLngToPercent(b.latitude, b.longitude);
          return (
            <button
              key={b.name}
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                applyCoords(b.latitude, b.longitude, b.name);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
              title={`Pin Brgy. ${b.name}`}
            >
              <span className="block w-2.5 h-2.5 rounded-full bg-navy-900/70 border border-white group-hover:scale-125 transition-transform" />
              <span className="hidden sm:inline-block mt-0.5 px-1.5 py-0.5 rounded bg-white/90 text-[9px] font-bold text-navy-900 shadow-xs whitespace-nowrap">
                {b.name}
              </span>
            </button>
          );
        })}

        {/* Active Dropped Pin */}
        <div
          style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none transition-all duration-150"
        >
          <div className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-md whitespace-nowrap mb-0.5">
            📍 Pinned ({pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)})
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white mx-auto shadow-md" />
        </div>
      </div>

      {/* Quick Barangay Pin Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mr-1">
          Quick Pin:
        </span>
        {BARANGAY_CENTROIDS.slice(0, 8).map((b) => (
          <button
            key={b.name}
            type="button"
            onClick={() => applyCoords(b.latitude, b.longitude, b.name)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-line text-ink-700 hover:border-brand-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1 border-t border-slate-200/80 font-mono">
        <span>
          Coordinates: {pin.latitude.toFixed(4)}° N, {pin.longitude.toFixed(4)}° E
        </span>
        <span className="text-emerald-700 font-sans font-bold">
          ✓ PostGIS / Firestore Ready
        </span>
      </div>
    </div>
  );
}

