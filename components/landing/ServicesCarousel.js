const services = [
  { icon: "📋", label: "Missing person reporting" },
  { icon: "🧭", label: "Found person reporting" },
  { icon: "✨", label: "AI facial matching" },
  { icon: "🏛️", label: "Barangay verification" },
  { icon: "🗺️", label: "Heatmap & analytics" },
  { icon: "🚓", label: "CCPO command dashboard" },
  { icon: "🔔", label: "Real-time case alerts" },
  { icon: "🗂️", label: "Case status tracking" },
];

function Track({ ariaHidden = false }) {
  return (
    <div className="flex gap-5 shrink-0" aria-hidden={ariaHidden}>
      {services.map((s, i) => (
        <div
          key={i}
          className="w-56 shrink-0 rounded-lg border border-line bg-white shadow-card p-6 flex flex-col gap-3"
        >
          <div className="w-11 h-11 rounded-md bg-teal-100 flex items-center justify-center text-xl">
            {s.icon}
          </div>
          <div className="font-head font-bold text-sm text-navy-900 leading-snug">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServicesCarousel() {
  return (
    <section className="py-16 md:py-20 bg-paper overflow-hidden">
      <div className="container-page mb-10 text-center">
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-navy-900 mb-3">
          What TraceNet provides
        </h2>
        <p className="text-ink-700 max-w-xl mx-auto">
          One platform, every service a missing person case touches.
        </p>
      </div>

      <div className="relative w-full [mask-image:linear-gradient(90deg,transparent,white_8%,white_92%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          <Track />
          <div className="w-5 shrink-0" />
          <Track ariaHidden />
          <div className="w-5 shrink-0" />
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}</style>
    </section>
  );
}
