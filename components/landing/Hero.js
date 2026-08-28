import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-brand-700 text-white">
      <div className="container-page py-24 md:py-32 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase text-teal-500 mb-6">
            AI-Assisted · Cebu City
          </div>
          <h1 className="font-head font-extrabold text-4xl md:text-5xl leading-tight mb-5">
            Missing person cases move faster when everyone sees the same picture.
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-9 max-w-xl">
            TraceNet connects citizens, barangay officials, and the Cebu
            City Police Office on one platform — so reports get verified,
            matched, and escalated in hours, not days.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/sign-up" variant="primary" className="px-8 py-3.5 text-base">
              Create your account
            </Button>
            <Button href="/sign-in" variant="onDark" className="px-8 py-3.5 text-base">
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* decorative node-graph, echoes the logo mark */}
      <svg
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-[560px] h-[560px] opacity-[0.18] pointer-events-none hidden lg:block"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="200" r="130" stroke="white" strokeWidth="1" />
        <circle cx="120" cy="120" r="5" fill="#18C2DF" />
        <circle cx="280" cy="130" r="5" fill="#18C2DF" />
        <circle cx="140" cy="280" r="5" fill="#18C2DF" />
        <circle cx="270" cy="270" r="5" fill="#18C2DF" />
        <line x1="120" y1="120" x2="280" y2="270" stroke="white" strokeWidth="1" />
        <line x1="280" y1="130" x2="140" y2="280" stroke="white" strokeWidth="1" />
      </svg>
    </section>
  );
}
