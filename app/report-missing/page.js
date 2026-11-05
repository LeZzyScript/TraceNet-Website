"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Field, Input, Textarea, Select, FileUpload } from "@/components/ui/Input";
import BarangaySelect from "@/components/ui/BarangaySelect";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { submitWebReport } from "@/lib/liveData";
import { isCloudinaryConfigured, uploadPhoto } from "@/lib/cloudinary";
import { submitMissingReport } from "@/lib/db";

// Sample values are only used in demo mode. With Firebase configured the form
// starts empty so a sample person can never be filed as a real report.
const DEMO_FORM = {
  firstName: "Maria",
  lastName: "Santos",
  age: "34",
  gender: "Female",
  lastSeenLocation: "Brgy. Labangon, Cebu City",
  clothingDescription: "White blouse, blue jeans, wearing eyeglasses",
  dateMissing: "2026-06-28",
  timeMissing: "09:00",
  circumstances: "Left home for the market in the morning and did not return.",
  reporterName: "Juan dela Cruz",
  relationship: "Son / Family member",
  contactNumber: "0917-123-4567",
  barangay: "Labangon",
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "Female",
  lastSeenLocation: "",
  clothingDescription: "",
  dateMissing: "",
  timeMissing: "",
  circumstances: "",
  reporterName: "",
  relationship: "",
  contactNumber: "",
  barangay: "",
};

export default function ReportMissingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState(isFirebaseConfigured ? EMPTY_FORM : DEMO_FORM);

  const needsSignIn = isFirebaseConfigured && !authLoading && !user;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Live path: write to Firestore, same shape as the mobile app.
    if (isFirebaseConfigured) {
      if (!user) {
        setError("Please sign in to submit a report.");
        return;
      }
      setSubmitting(true);
      try {
        let photoUrl = null;
        if (photoFile) {
          if (!isCloudinaryConfigured) {
            window.alert("Photo hosting is not configured; submitting without the photo.");
          } else {
            try {
              photoUrl = await uploadPhoto(photoFile);
            } catch (uploadErr) {
              window.alert(
                `${uploadErr.message} Your report will be submitted without the photo.`
              );
            }
          }
        }
        const { id } = await submitWebReport(
          {
            type: "missing",
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            age: formData.age,
            sex: formData.gender,
            location: formData.lastSeenLocation,
            description: formData.clothingDescription,
            photoUrl,
            reporterName: formData.reporterName,
            contactNumber: formData.contactNumber,
            relationship: formData.relationship,
            dateMissing: formData.dateMissing,
            timeMissing: formData.timeMissing,
            circumstances: formData.circumstances,
            barangay: formData.barangay,
          },
          user
        );
        router.push(`/report-submitted?id=${id}`);
      } catch (err) {
        console.error(err);
        setError(
          err?.code === "permission-denied"
            ? "Submission was blocked by the database rules. Please contact support."
            : "Could not submit your report. Please check your connection and try again."
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Demo path (no Firebase configured): original behaviour.
    setSubmitting(true);
    try {
      const res = await submitMissingReport(formData);
      if (res.success) {
        router.push("/report-submitted");
      } else {
        alert("Submission failed: " + res.error);
      }
    } catch (err) {
      console.error(err);
      router.push("/report-submitted");
    } finally {
      setSubmitting(false);
    }
  }

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {needsSignIn && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You need to be signed in to file a report.{" "}
              <Link href="/sign-in" className="font-bold underline">
                Sign in
              </Link>{" "}
              or{" "}
              <Link href="/sign-up" className="font-bold underline">
                create an account
              </Link>{" "}
              (the same account works in the TraceNet mobile app).
            </div>
          )}
          {/* Step 1: Person details (Figure 13) */}
          <Card className="p-6">
            <SectionLabel>Person details (Step 1 of 3)</SectionLabel>
            <div className="mb-4">
              <FileUpload
                label="Upload a recent photo"
                fileName={photoFile ? photoFile.name : undefined}
                onChange={setPhotoFile}
                hint="Used for AI facial matching (FaceNet 512-d embeddings) · JPG or PNG"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First name">
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Field>
              <Field label="Last name">
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </Field>
              <Field label="Gender">
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
            </div>

            <Field label="Last known location">
              <Input
                value={formData.lastSeenLocation}
                onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                placeholder="📍 Brgy. Labangon, Cebu City"
                required
              />
            </Field>

            <Field label="Clothing description">
              <Textarea
                value={formData.clothingDescription}
                onChange={(e) => setFormData({ ...formData, clothingDescription: e.target.value })}
                placeholder="White blouse, blue jeans, wearing eyeglasses..."
                required
              />
            </Field>
          </Card>

          {/* Step 2: Last seen details */}
          <Card className="p-6">
            <SectionLabel>Last seen details (Step 2 of 3)</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date last seen">
                <Input
                  type="date"
                  value={formData.dateMissing}
                  onChange={(e) => setFormData({ ...formData, dateMissing: e.target.value })}
                  required
                />
              </Field>
              <Field label="Time last seen">
                <Input
                  type="time"
                  value={formData.timeMissing}
                  onChange={(e) => setFormData({ ...formData, timeMissing: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Circumstances">
              <Textarea
                value={formData.circumstances}
                onChange={(e) => setFormData({ ...formData, circumstances: e.target.value })}
                placeholder="Left home for the market and did not return..."
              />
            </Field>
          </Card>

          {/* Step 3: Reporter contact info */}
          <Card className="p-6">
            <SectionLabel>Your contact information (Step 3 of 3)</SectionLabel>
            <Field label="Your name">
              <Input
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Relationship to missing person">
                <Input
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
                />
              </Field>
              <Field label="Contact number">
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </Field>
            </div>
            <Field label="Barangay of jurisdiction">
              <BarangaySelect
                defaultValue={formData.barangay}
                onChange={(value) => setFormData((f) => ({ ...f, barangay: value }))}
              />
            </Field>
          </Card>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 text-base shadow-button"
            disabled={submitting || needsSignIn}
          >
            {submitting ? "Submitting to Barangay..." : "Submit Report for Verification"}
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
