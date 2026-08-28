import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Field, Input, Textarea, Select, FileUpload } from "@/components/ui/Input";
import BarangaySelect from "@/components/ui/BarangaySelect";
import Button from "@/components/ui/Button";

export default function ReportMissingPage() {
  return (
    <DashboardShell>
      <div className="max-w-xl">
        <h1 className="font-head font-extrabold text-2xl text-navy-900 mb-1">
          Report a missing person
        </h1>
        <p className="text-sm text-ink-500 mb-8">
          Fill in as much detail as you can — barangay verification and AI
          matching happen automatically once you submit.
        </p>

        <form className="space-y-8">
          <Card className="p-6">
            <SectionLabel>Person details</SectionLabel>
            <div className="mb-4">
              <FileUpload
                label="Upload a recent photo"
                hint="Used for AI facial matching · JPG or PNG"
              />
            </div>
            <Field label="Full name of missing person">
              <Input placeholder="Maria Santos" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <Input placeholder="34" />
              </Field>
              <Field label="Gender">
                <Select defaultValue="female">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </Select>
              </Field>
            </div>
            <Field label="Last known location">
              <Input placeholder="📍 Brgy. Labangon, Cebu City" />
            </Field>
            <Field label="Clothing description">
              <Textarea placeholder="White blouse, blue jeans, wearing eyeglasses..." />
            </Field>
          </Card>

          <Card className="p-6">
            <SectionLabel>Last seen details</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date last seen">
                <Input type="date" />
              </Field>
              <Field label="Time last seen">
                <Input type="time" />
              </Field>
            </div>
            <Field label="Circumstances">
              <Textarea placeholder="Left home for the market and did not return..." />
            </Field>
            <Field label="Known medical conditions (optional)">
              <Input placeholder="None" />
            </Field>
          </Card>

          <Card className="p-6">
            <SectionLabel>Your contact information</SectionLabel>
            <Field label="Your name">
              <Input defaultValue="Juan dela Cruz" />
            </Field>
            <Field label="Relationship to missing person">
              <Input placeholder="Son" />
            </Field>
            <Field label="Contact number">
              <Input placeholder="09XX-XXX-XXXX" />
            </Field>
            <Field label="Barangay to notify">
              <BarangaySelect />
            </Field>
          </Card>

          <Button href="/report-submitted" variant="primary" className="w-full">
            Submit report
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
