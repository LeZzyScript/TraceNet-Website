"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Button from "@/components/ui/Button";

function ReportSubmittedInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const code = id ? `#${String(id).slice(-4).toUpperCase()}` : "#2038";
  const statusHref = id ? `/case-status?id=${id}` : "/case-status";

  return (
    <div className="max-w-md mx-auto text-center py-10">
      <div className="w-16 h-16 rounded-full bg-[#E8F8F1] text-success flex items-center justify-center text-3xl mx-auto mb-6">
        ✓
      </div>
      <h1 className="font-head font-extrabold text-xl text-navy-900 mb-2">Report submitted</h1>
      <p className="text-sm text-ink-700 leading-relaxed mb-8">
        Case {code} has been sent to the barangay jurisdiction for verification.
        You&rsquo;ll be notified of every update across Web and Mobile.
      </p>
      <div className="flex flex-col gap-3">
        <Button href={statusHref} variant="primary">Track case status</Button>
        <Button href="/dashboard" variant="ghost">Back to dashboard</Button>
      </div>
    </div>
  );
}

export default function ReportSubmittedPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="text-sm text-ink-500 py-10 text-center">Loading...</div>}>
        <ReportSubmittedInner />
      </Suspense>
    </DashboardShell>
  );
}
