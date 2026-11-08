"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import BarangaySelect from "@/components/ui/BarangaySelect";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

const EMERGENCY_HOTLINES = [
  {
    agency: "Cebu City Police Office (CCPO) Command Center",
    number: "(032) 233-6793 / 0917-627-3579",
    badge: "24/7 Police Dispatch",
  },
  {
    agency: "Cebu City Disaster & Emergency Command (C3)",
    number: "911 / 166",
    badge: "Citywide Emergency",
  },
  {
    agency: "Barangay Labangon Peace & Order Desk",
    number: "(032) 261-4021",
    badge: "Barangay Jurisdiction",
  },
  {
    agency: "DSWD Field Office VII — Crisis Intervention Unit",
    number: "(032) 232-9505",
    badge: "Child & Vulnerable Protection",
  },
];

const SAFETY_TIPS = [
  "Provide the clearest, most recent front-facing photo available so the 80% DeepFace (FaceNet 512-d) engine can extract accurate craniofacial landmarks.",
  "Include specific clothing colors, eyewear, scars, or Cebuano/Tagalog/English descriptors to boost the 20% spaCy NLP description similarity score.",
  "Drop an exact map pin on the last-seen location so nearby barangays within 1–5 km receive immediate spatial coordination alerts.",
  "There is NO 24-hour waiting period required to report a missing child, senior citizen, or vulnerable person to your Barangay Desk or CCPO.",
];

export default function CitizenProfilePage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(
    profile?.name || user?.displayName || "Juan dela Cruz"
  );
  const [email, setEmail] = useState(user?.email || "juan@example.com");
  const [contactNumber, setContactNumber] = useState(
    profile?.contactNumber || "0917-123-4567"
  );
  const [barangay, setBarangay] = useState(profile?.barangay || "Labangon");
  const [prefs, setPrefs] = useState({
    aiMatchAlerts: true,
    barangayUpdates: true,
    nearbyBroadcasts: true,
    smsFallback: false,
  });
  const [savedToast, setSavedToast] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-head font-extrabold text-2xl text-navy-900">
            My Profile &amp; Safety Center
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Account settings, alert preferences, and Cebu City emergency hotlines (Manuscript Fig 22 &amp; Fig 3.2)
          </p>
        </div>

        {savedToast && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
            ✓ Profile details and notification preferences saved.
          </div>
        )}

        {/* Profile Summary Banner (Figure 22 p. 84) */}
        <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-600 text-white font-head font-extrabold text-xl flex items-center justify-center shadow-sm">
              {name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-head font-extrabold text-lg text-navy-900">
                  {name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-600">
                  Verified Citizen
                </span>
              </div>
              <div className="text-xs text-ink-500 mt-0.5">
                {email} · {contactNumber}
              </div>
              <div className="text-xs text-ink-400 mt-0.5">
                Home Jurisdiction: <strong>Brgy. {barangay}, Cebu City</strong>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information Form */}
          <Card className="p-6">
            <SectionLabel>Personal &amp; Contact Details</SectionLabel>
            <form onSubmit={handleSave} className="space-y-3">
              <Field label="Full Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Mobile Contact Number">
                <Input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </Field>
              <Field label="Home Barangay (Cebu City)">
                <BarangaySelect
                  defaultValue={barangay}
                  onChange={(val) => setBarangay(val)}
                />
              </Field>
              <Button type="submit" variant="primary" className="w-full !mt-4">
                Save Profile Changes
              </Button>
            </form>
          </Card>

          {/* Notification & Privacy Settings */}
          <div className="space-y-6">
            <Card className="p-6">
              <SectionLabel>Alert &amp; Notification Toggles</SectionLabel>
              <div className="space-y-3 text-xs">
                {[
                  {
                    key: "aiMatchAlerts",
                    title: "80/20 AI Match Alerts",
                    desc: "Immediate push/web alert when a high-confidence facial + text match is found",
                  },
                  {
                    key: "barangayUpdates",
                    title: "Barangay & CCPO Status Updates",
                    desc: "Notify when your report is verified, escalated, or resolved",
                  },
                  {
                    key: "nearbyBroadcasts",
                    title: "Nearby Missing Person Advisories (5 km)",
                    desc: "Community sighting alerts within your Cebu City barangay radius",
                  },
                  {
                    key: "smsFallback",
                    title: "SMS Fallback Notifications",
                    desc: "Send critical match alerts to your registered mobile number",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-3 py-2 border-b border-dashed border-line last:border-none cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-navy-900">{item.title}</div>
                      <div className="text-[11px] text-ink-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[item.key]}
                      onChange={() =>
                        setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                      }
                      className="mt-1 h-4 w-4 rounded border-line text-brand-600"
                    />
                  </label>
                ))}
              </div>
            </Card>

            {/* Safety Tips (Workflow Fig 3.2) */}
            <Card className="p-6 bg-slate-50/70">
              <SectionLabel>Reporting Safety Tips (Fig 3.2)</SectionLabel>
              <ul className="space-y-2 text-xs text-ink-700 list-disc pl-4 leading-relaxed">
                {SAFETY_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Cebu City Emergency Hotlines Directory (Workflow Fig 3.2) */}
        <Card className="p-6">
          <SectionLabel>Cebu City Emergency Hotlines &amp; Coordination Desks</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {EMERGENCY_HOTLINES.map((h) => (
              <div
                key={h.agency}
                className="p-3.5 rounded-lg border border-line bg-paper flex items-center justify-between gap-3"
              >
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-600 mb-1">
                    {h.badge}
                  </span>
                  <div className="text-xs font-bold text-navy-900">{h.agency}</div>
                  <div className="text-xs font-mono font-extrabold text-[#0E8FA3] mt-0.5">
                    📞 {h.number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

