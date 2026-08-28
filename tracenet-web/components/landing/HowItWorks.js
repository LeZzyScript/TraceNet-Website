const steps = [
  {
    n: 1,
    title: "Report",
    body: "A citizen files a missing or found person report from the app or website — photo, last known location, and description.",
  },
  {
    n: 2,
    title: "Verify & match",
    body: "The barangay verifies the report while TraceNet's AI scans it against existing records citywide for a possible match.",
  },
  {
    n: 3,
    title: "Coordinate & resolve",
    body: "Confirmed matches and escalations reach the CCPO command center instantly, so response teams can act without delay.",
  },
];

export default function HowItWorks() {
  return (
    <section className="container-page py-20 md:py-24">
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-navy-900 mb-3">
          How TraceNet works
        </h2>
        <p className="text-ink-700">From a filed report to a resolved case, in three coordinated steps.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-head font-extrabold text-sm flex items-center justify-center mb-4">
              {s.n}
            </div>
            <div className="bg-paper rounded-lg p-6 w-full">
              <h3 className="font-head font-bold text-base text-navy-900 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-700 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
