import Button from "@/components/ui/Button";

export default function CtaBand() {
  return (
    <section className="container-page py-20 md:py-24">
      <div className="rounded-lg bg-gradient-to-br from-brand-600 to-navy-900 text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-lg">
          <h2 className="font-head font-extrabold text-2xl md:text-3xl mb-3">
            Every hour matters in a missing person case.
          </h2>
          <p className="text-white/80 leading-relaxed">
            Create your TraceNet account and file or track a report in
            minutes — verified by your barangay, matched by AI, backed by
            the CCPO.
          </p>
        </div>
        <Button href="/sign-up" variant="onDark" className="px-8 py-3.5 text-base whitespace-nowrap">
          Create your account →
        </Button>
      </div>
    </section>
  );
}
