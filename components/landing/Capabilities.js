const capabilities = [
  { icon: "📋", title: "Structured reporting", body: "File a missing or found person report with guided steps — no more scattered social media posts or verbal reports that go nowhere." },
  { icon: "✨", title: "AI-assisted matching", body: "Every new report is scanned against existing records citywide, surfacing likely matches with a confidence score for a human to confirm." },
  { icon: "🏛️", title: "Barangay verification", body: "Reports route straight to the responsible barangay for verification before reaching CCPO — local officials stay in the loop, not out of it." },
  { icon: "🗺️", title: "Command-level visibility", body: "The CCPO command dashboard tracks every active case, escalation, and hotspot across Cebu City in real time." },
  { icon: "🔔", title: "Real-time notifications", body: "Citizens are notified the moment their case is verified, matched, or escalated — no need to keep calling the barangay hall." },
  { icon: "🔒", title: "Verified access only", body: "Barangay and CCPO accounts go through identity verification before they can act on a case, keeping the system accountable." },
  { icon: "📊", title: "Citywide analytics", body: "Heatmaps and resolution-time tracking help commanders see where cases are concentrating and where to send resources." },
];

export default function Capabilities() {
  return (
    <section id="how-it-helps" className="container-page py-20 md:py-28">
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-navy-900 mb-3">
          Capabilities
        </h2>
        <p className="text-ink-700">
          Everything Cebu City needs to move a missing person case from
          report to resolution.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((c) => (
          <div
            key={c.title}
            className="bg-brand-100/60 rounded-lg p-6 hover:bg-brand-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-lg mb-4 shadow-sm">
              {c.icon}
            </div>
            <h3 className="font-head font-bold text-base text-navy-900 mb-2">
              {c.title}
            </h3>
            <p className="text-sm text-ink-700 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
