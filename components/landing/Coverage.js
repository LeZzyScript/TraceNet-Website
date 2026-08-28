const barangays = [
  "Labangon", "Mabolo", "Guadalupe", "Pardo", "Talamban", "Lahug",
  "Capitol Site", "Basak Pardo", "Duljo Fatima", "Tejero", "Banilad", "Apas",
];

export default function Coverage() {
  return (
    <section id="coverage" className="bg-navy-900 text-white py-20 md:py-28">
      <div className="container-page grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-teal-500 mb-3">
            Coverage
          </div>
          <h2 className="font-head font-extrabold text-3xl md:text-4xl mb-5">
            Live across Cebu City's barangays.
          </h2>
          <p className="text-white/75 leading-relaxed mb-6 max-w-lg">
            TraceNet's pilot coverage spans barangays across Cebu City,
            coordinated through the CCPO command center. Reports aren't
            limited to a citizen's home barangay — AI matching runs
            citywide, so a match can surface from anywhere in the network.
          </p>
          <div className="flex flex-wrap gap-2">
            {barangays.map((b) => (
              <span
                key={b}
                className="text-xs font-semibold bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5"
              >
                {b}
              </span>
            ))}
            <span className="text-xs font-semibold bg-teal-500/15 text-teal-500 border border-teal-500/30 rounded-full px-3.5 py-1.5">
              + more barangays onboarding
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {[
            ["80+", "Barangays reachable citywide"],
            ["24/7", "Report intake, any time"],
            ["3", "Stakeholder roles connected"],
            ["1", "Command dashboard for CCPO"],
          ].map(([stat, label]) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-md p-6">
              <div className="font-head font-extrabold text-3xl text-teal-500 mb-1">{stat}</div>
              <div className="text-sm text-white/70 leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
