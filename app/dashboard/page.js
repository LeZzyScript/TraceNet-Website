import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/match-alert"
          className="flex items-start gap-3 bg-amber-50 border border-[#F0DBA5] rounded-md p-4 mb-8 hover:bg-[#FFF3D9] transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-[#7A5410]">1 potential match found</div>
            <div className="text-xs text-[#9C7420]">Case #2038 — Review now</div>
          </div>
        </Link>

        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/report-missing" className="rounded-md bg-brand-100 p-5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center mb-3">📋</div>
            <div className="font-bold text-sm text-navy-900">Report missing</div>
          </Link>
          <Link href="/report-found" className="rounded-md bg-teal-100 p-5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center mb-3">🧭</div>
            <div className="font-bold text-sm text-navy-900">Report found person</div>
          </Link>
        </div>

        <SectionLabel>My active cases</SectionLabel>
        <Link href="/case-status" className="block mb-10">
          <Card className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-bold text-sm text-navy-900">Maria Santos, 34</div>
                <div className="text-xs text-ink-400 mt-0.5">Reported June 28 · Brgy. Labangon</div>
              </div>
              <span className="text-[10px] font-extrabold bg-[#E8F8F1] text-success rounded-full px-2.5 py-1">
                ● Active
              </span>
            </div>
            <div className="text-xs text-ink-700 mt-3 pt-3 border-t border-dashed border-line">
              Verified by Brgy. Labangon · AI matching in progress
            </div>
          </Card>
        </Link>

        <SectionLabel>Notifications</SectionLabel>
        <div className="divide-y divide-line">
          <div className="flex gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm shrink-0">✓</div>
            <div>
              <div className="text-sm font-semibold text-navy-900">Your report has been verified</div>
              <div className="text-xs text-ink-400">Brgy. Labangon — 2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
