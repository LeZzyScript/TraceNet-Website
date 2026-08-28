"use client";

import { useState, useRef, useEffect } from "react";

export const CEBU_CITY_BARANGAYS = [
  "Adlaon", "Agsungot", "Apas", "Babag", "Bacayan", "Banilad", "Basak Pardo",
  "Basak San Nicolas", "Binaliw", "Bonbon", "Budla-an", "Buhisan", "Bulacao",
  "Buot-Taup Pardo", "Busay", "Calamba", "Cambinocot", "Camputhaw",
  "Capitol Site", "Carreta", "Central", "Cogon Pardo", "Cogon Ramos",
  "Day-as", "Duljo", "Ermita", "Guadalupe", "Guba", "Hippodromo", "Inayawan",
  "Kalubihan", "Kalunasan", "Kamagayan", "Kasambagan", "Kinasang-an Pardo",
  "Labangon", "Lahug", "Lorega", "Lusaran", "Luz", "Mabini", "Mabolo",
  "Malubog", "Mambaling", "Pahina Central", "Pahina San Nicolas", "Pamutan",
  "Pardo", "Pari-an", "Paril", "Pasil", "Pit-os", "Pulangbato",
  "Pung-ol-Sibugay", "Punta Princesa", "Quiot Pardo", "Sambag I",
  "Sambag II", "San Antonio", "San Jose", "San Nicolas Central", "San Roque",
  "Santa Cruz", "Sapangdaku", "Sawang Calero", "Sinsin", "Sirao", "Suba",
  "Sudlon I", "Sudlon II", "T. Padilla", "Tabunan", "Tagbao", "Talamban",
  "Taptap", "Tejero", "Tinago", "Tisa", "To-ong Pardo", "Zapatera",
];

/**
 * Type-to-filter barangay picker. No GPS/location detection is assumed
 * (citizens may be on a desktop browser) — they type a few letters and
 * pick from matching Cebu City barangays, or type the full name directly.
 */
export default function BarangaySelect({ defaultValue = "", placeholder = "Start typing a barangay..." }) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const matches =
    query.trim().length === 0
      ? []
      : CEBU_CITY_BARANGAYS.filter((b) =>
          b.toLowerCase().includes(query.trim().toLowerCase())
        ).slice(0, 8);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <input
        className="w-full border-[1.6px] border-line bg-white rounded-sm px-3.5 py-3 text-sm text-ink-900 font-medium placeholder:text-ink-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-line rounded-md shadow-card max-h-56 overflow-y-auto">
          {matches.map((b) => (
            <button
              type="button"
              key={b}
              onMouseDown={() => {
                setQuery(b);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm text-ink-900 hover:bg-brand-100 transition-colors"
            >
              {b}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
