const pins = [
  { name: "Labangon", x: 120, y: 300 },
  { name: "Mabolo", x: 250, y: 210 },
  { name: "Guadalupe", x: 150, y: 240 },
  { name: "Pardo", x: 100, y: 360 },
  { name: "Talamban", x: 280, y: 100 },
  { name: "Lahug", x: 220, y: 170 },
  { name: "Capitol Site", x: 200, y: 220 },
  { name: "Banilad", x: 260, y: 150 },
];

export default function CebuMap() {
  return (
    <section id="coverage" className="bg-navy-900 text-white py-20 md:py-28">
      <div className="container-page grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-teal-500 mb-3">
            Coverage
          </div>
          <h2 className="font-head font-extrabold text-3xl md:text-4xl mb-5">
            Live across Cebu City&rsquo;s barangays.
          </h2>
          <p className="text-white/75 leading-relaxed mb-6 max-w-lg">
            TraceNet&rsquo;s pilot coverage spans barangays across Cebu City,
            coordinated through the CCPO command center. Reports aren&rsquo;t
            limited to a citizen&rsquo;s home barangay — AI matching runs
            citywide, so a match can surface from anywhere in the network.
          </p>
          <div className="flex flex-wrap gap-2">
            {pins.map((p) => (
              <span
                key={p.name}
                className="text-xs font-semibold bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5"
              >
                {p.name}
              </span>
            ))}
            <span className="text-xs font-semibold bg-teal-500/15 text-teal-500 border border-teal-500/30 rounded-full px-3.5 py-1.5">
              + more barangays onboarding
            </span>
          </div>
        </div>

        {/* Stylized, illustrative map — not to scale / not GIS-accurate */}
        <div className="relative bg-white/5 border border-white/10 rounded-lg p-6">
          <svg viewBox="0 0 380 440" className="w-full h-auto">
            <path
              d="M190 20 C260 30 320 90 330 160 C340 230 300 300 280 360 C260 410 210 420 170 415 C110 405 60 360 50 300 C40 240 60 170 100 110 C130 65 150 25 190 20 Z"
              fill="#152A52"
              stroke="#1B5FCC"
              strokeWidth="2"
            />
            {pins.map((p) => (
              <g key={p.name}>
                <circle cx={p.x} cy={p.y} r="6" fill="#18C2DF" />
                <circle cx={p.x} cy={p.y} r="11" fill="#18C2DF" opacity="0.25" />
              </g>
            ))}
          </svg>
          <p className="text-center text-[11px] text-white/40 mt-2">
            Illustrative coverage map — not drawn to scale
          </p>
        </div>
      </div>
    </section>
  );
}
