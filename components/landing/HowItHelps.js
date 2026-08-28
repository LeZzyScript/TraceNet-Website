const items = [
  {
    icon: "📋",
    title: "Report in minutes, not forms in triplicate",
    body: "Citizens file a missing or found person report from their phone or browser — structured fields replace scattered social media posts and verbal reports.",
  },
  {
    icon: "✨",
    title: "AI-assisted facial matching",
    body: "Every new report is automatically scanned against existing found-person records citywide, surfacing likely matches with a confidence score for a human to confirm.",
  },
  {
    icon: "🏛️",
    title: "Barangay verification, built in",
    body: "Reports route straight to the responsible barangay for verification before reaching CCPO — keeping local officials in the loop, not out of it.",
  },
  {
    icon: "🗺️",
    title: "City-wide visibility for command",
    body: "The CCPO command dashboard tracks every active case, escalation, and hotspot across Cebu City in real time, instead of piecing it together barangay by barangay.",
  },
];

const stakeholders = [
  { role: "Citizens & families", desc: "File and track reports, get notified the moment a potential match appears." },
  { role: "Barangay officials", desc: "Verify incoming reports, forward high-priority cases, coordinate locally." },
  { role: "Cebu City Police Office", desc: "Command-level view of every case, escalation, and AI match citywide." },
];

export default function HowItHelps() {
  return (
    <section id="how-it-helps" className="container-page py-20 md:py-28">
      <div className="max-w-2xl mb-14">
        <div className="text-xs font-extrabold uppercase tracking-widest text-brand-600 mb-3">
          How TraceNet helps
        </div>
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-navy-900 mb-4">
          One coordinated system, instead of four disconnected ones.
        </h2>
        <p className="text-ink-700 leading-relaxed">
          Missing person cases today move through social media posts, verbal
          reports, and paper trails across independent barangays. TraceNet
          replaces that with a single reporting and coordination pipeline.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-20">
        {items.map((item) => (
          <div key={item.title} className="p-6 rounded-md border border-line bg-white shadow-card">
            <div className="w-11 h-11 rounded-md bg-brand-100 flex items-center justify-center text-xl mb-4">
              {item.icon}
            </div>
            <h3 className="font-head font-bold text-lg text-navy-900 mb-2">{item.title}</h3>
            <p className="text-sm text-ink-700 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div id="stakeholders">
        <h3 className="font-head font-extrabold text-2xl text-navy-900 mb-6">
          Built for everyone in the response chain
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {stakeholders.map((s) => (
            <div key={s.role} className="p-6 rounded-md bg-paper border border-line">
              <div className="font-head font-bold text-navy-900 mb-1.5">{s.role}</div>
              <p className="text-sm text-ink-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
