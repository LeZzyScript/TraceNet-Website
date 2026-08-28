import DashboardShell from "@/components/DashboardShell";
import Button from "@/components/ui/Button";

export default function ReportSubmittedPage() {
  return (
    <DashboardShell>
      <div className="max-w-md mx-auto text-center py-10">
        <div className="w-16 h-16 rounded-full bg-[#E8F8F1] text-success flex items-center justify-center text-3xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="font-head font-extrabold text-xl text-navy-900 mb-2">Report submitted</h1>
        <p className="text-sm text-ink-700 leading-relaxed mb-8">
          Case #2038 has been sent to Brgy. Labangon for verification.
          You&rsquo;ll be notified of every update.
        </p>
        <div className="flex flex-col gap-3">
          <Button href="/case-status" variant="primary">Track case status</Button>
          <Button href="/dashboard" variant="ghost">Back to dashboard</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
