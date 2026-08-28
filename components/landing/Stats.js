const stats = [
  { value: "2,500+", label: "Missing person cases reported yearly in Cebu City", source: "PLACEHOLDER — cite PNP-CCPO records" },
  { value: "96%", label: "Of Filipinos are internet users, not just app users", source: "PLACEHOLDER — cite DICT / PSA report" },
  { value: "40%", label: "Drop in search effectiveness from fragmented reporting between jurisdictions", source: "As cited in Abhimanyu & Veni, 2023" },
  { value: "80+", label: "Barangays reachable through TraceNet's citywide coordination", source: "Platform coverage, this study" },
];

export default function Stats() {
  return (
    <section className="container-page py-20 md:py-24">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-navy-900 mb-3">
          Why this matters
        </h2>
        <p className="text-ink-700">
          The scale of the problem TraceNet is built to address.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-brand-100/60 rounded-lg p-6">
            <div className="font-head font-extrabold text-3xl text-brand-600 mb-2">
              {s.value}
            </div>
            <p className="text-sm text-ink-900 font-semibold leading-snug mb-2">
              {s.label}
            </p>
            <p className="text-[11px] text-ink-400 leading-snug">{s.source}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-400 text-center mt-8 max-w-2xl mx-auto leading-relaxed">
        Figures above are placeholders for layout purposes. Replace with
        verified statistics (PNP-CCPO case records, DICT/PSA internet usage
        reports, etc.) before presenting to your panel.
      </p>
    </section>
  );
}
