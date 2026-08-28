import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Field, Input, Textarea, FileUpload } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ReportFoundPage() {
  return (
    <DashboardShell>
      <div className="max-w-xl">
        <h1 className="font-head font-extrabold text-2xl text-navy-900 mb-1">
          Report a found person
        </h1>
        <p className="text-sm text-ink-500 mb-8">
          Help reunite someone with their family. No live camera capture on
          web — attach an existing photo instead.
        </p>

        <Card className="p-6">
          <form className="space-y-4">
            <FileUpload
              label="Upload photo"
              hint="Used for AI facial matching · JPG or PNG"
            />
            <Field label="Approximate age &amp; gender">
              <Input placeholder="Female, appears mid-30s" />
            </Field>

            <Field label="Location found">
              <div className="flex items-center gap-3 border-[1.6px] border-line rounded-sm px-3.5 py-3 bg-paper">
                <span className="text-base">📍</span>
                <div>
                  <div className="text-sm font-semibold text-navy-900">
                    Brgy. Mabolo, Cebu City
                  </div>
                  <div className="text-[11px] text-ink-400">
                    Auto-detected from photo location &amp; device GPS
                  </div>
                </div>
              </div>
            </Field>

            <Field label="Current condition / notes">
              <Textarea placeholder="Disoriented, unable to state name..." />
            </Field>
            <Field label="Currently sheltered at">
              <Input placeholder="Brgy. Mabolo hall" />
            </Field>

            <Button href="/report-submitted" variant="primary" className="w-full !mt-6">
              Submit report
            </Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
