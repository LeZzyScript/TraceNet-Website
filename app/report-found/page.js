"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea, Select, FileUpload } from "@/components/ui/Input";
import LocationPinPicker from "@/components/ui/LocationPinPicker";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { submitWebReport } from "@/lib/liveData";
import { isCloudinaryConfigured, uploadPhoto } from "@/lib/cloudinary";

export default function ReportFoundPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "Female",
    location: "Brgy. Mabolo, Cebu City",
    barangay: "Mabolo",
    latitude: 10.321,
    longitude: 123.921,
    description: "",
    shelteredAt: "Brgy. Mabolo hall",
  });

  const needsSignIn = isFirebaseConfigured && !authLoading && !user;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isFirebaseConfigured) {
      router.push("/report-submitted");
      return;
    }

    if (!user) {
      setError("Please sign in to submit a sighting report.");
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = null;
      if (photoFile && isCloudinaryConfigured) {
        try {
          photoUrl = await uploadPhoto(photoFile);
        } catch (uploadErr) {
          window.alert(`${uploadErr.message} Submitting without the photo.`);
        }
      }

      const fullDesc = [
        formData.description.trim(),
        formData.shelteredAt ? `Sheltered at: ${formData.shelteredAt.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const { id } = await submitWebReport(
        {
          type: "sighting",
          name: formData.name.trim() || "Unidentified Found Person",
          age: formData.age,
          sex: formData.sex,
          location: formData.location.trim(),
          barangay: formData.barangay,
          latitude: formData.latitude,
          longitude: formData.longitude,
          description: fullDesc || "Found person sighting reported via web portal",
          photoUrl,
        },
        user
      );
      router.push(`/report-submitted?id=${id}`);
    } catch (err) {
      console.error(err);
      setError("Could not submit your sighting report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

        {needsSignIn && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You need to be signed in to file a sighting report.{" "}
            <Link href="/sign-in" className="font-bold underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/sign-up" className="font-bold underline">
              create an account
            </Link>
            .
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FileUpload
              label="Upload photo"
              fileName={photoFile ? photoFile.name : undefined}
              onChange={setPhotoFile}
              hint="Used for AI facial matching · JPG or PNG"
            />
            <Field label="Name (if known)">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Leave blank if unidentified"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Approximate age">
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="34"
                />
              </Field>
              <Field label="Gender">
                <Select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </Select>
              </Field>
            </div>

            <Field label="Location found">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Brgy. Mabolo, Cebu City"
                required
              />
            </Field>

            <LocationPinPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              barangay={formData.barangay}
              onSelectLocation={({ latitude, longitude, barangay, locationText }) =>
                setFormData((prev) => ({
                  ...prev,
                  latitude,
                  longitude,
                  barangay: barangay || prev.barangay,
                  location: locationText,
                }))
              }
            />

            <Field label="Current condition / clothing / notes">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Disoriented, unable to state name, wearing white blouse..."
                required
              />
            </Field>
            <Field label="Currently sheltered at">
              <Input
                value={formData.shelteredAt}
                onChange={(e) => setFormData({ ...formData, shelteredAt: e.target.value })}
                placeholder="Brgy. Mabolo hall"
              />
            </Field>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full !mt-6"
              disabled={submitting || needsSignIn}
            >
              {submitting ? "Submitting report..." : "Submit report"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
