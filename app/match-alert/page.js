import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function MatchAlertPage() {
  return (
    <DashboardShell>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-head font-extrabold text-2xl text-navy-900">AI match alert</h1>
          <p className="text-sm text-ink-500 mt-1">A potential match was detected</p>
        </div>

        <Card className="p-6">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-[#0E8FA3] text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-5">
            ✨ AI facial match — 87% confidence
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 text-center">
              <div className="w-full aspect-square rounded-md bg-brand-100 flex items-center justify-center text-2xl text-brand-600">🧑</div>
              <div className="text-sm font-bold text-navy-900 mt-2">Maria Santos</div>
              <div className="text-xs text-ink-400">Missing · Brgy. Labangon</div>
            </div>
            <div className="text-ink-400 text-lg">↔</div>
            <div className="flex-1 text-center">
              <div className="w-full aspect-square rounded-md bg-brand-100 flex items-center justify-center text-2xl text-brand-600">❔</div>
              <div className="text-sm font-bold text-navy-900 mt-2">Unidentified F.</div>
              <div className="text-xs text-ink-400">Found · Brgy. Mabolo</div>
            </div>
          </div>

          <div className="text-xs font-semibold text-ink-700 mb-1.5">Match confidence score</div>
          <div className="h-2.5 rounded-full bg-[#EEF2FA] overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-teal-500 to-brand-600" style={{ width: "87%" }} />
          </div>
          <div className="text-right text-xs font-extrabold text-brand-600 mb-5">87%</div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">✓ Age match</span>
            <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">✓ Gender match</span>
            <span className="text-xs font-bold bg-paper border border-line rounded-full px-3 py-1.5 text-ink-700">✓ Location proximity</span>
          </div>

          <div className="flex gap-3">
            <Button href="/case-status" variant="primary" className="flex-1">✓ Confirm match</Button>
            <Button href="/report-found" variant="outline" className="flex-1">Review case</Button>
          </div>
          <p className="text-[11px] text-ink-400 text-center mt-5 leading-relaxed">
            Confirming notifies the family and Cebu City Police Office
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}
