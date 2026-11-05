"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/Input";
import BarangaySelect from "@/components/ui/BarangaySelect";
import Button from "@/components/ui/Button";
import { isFirebaseConfigured } from "@/lib/firebase";
import { friendlyAuthError, registerCitizen } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateAccount() {
    if (isFirebaseConfigured) {
      if (!name || !email || !contactNumber || !password) {
        setError("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        await registerCitizen({ name, email, contactNumber, password });
        router.push("/dashboard");
      } catch (err) {
        setError(friendlyAuthError(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Demo mode (Firebase not configured): simulate an account existing in
    // this browser only, so Sign In can check against it.
    window.localStorage.setItem("tracenet_demo_account", "true");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-icon.png" alt="TraceNet" width={52} height={52} className="rounded-2xl shadow-card" />
          <h1 className="font-head font-extrabold text-2xl text-navy-900 mt-4">
            Create your account
          </h1>
          <p className="text-sm text-ink-500 mt-1">Report and track missing person cases</p>
        </div>

        <form className="bg-white border border-line rounded-lg shadow-card p-8">
          <Field label="Full name">
            <Input
              placeholder="Juan dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email address">
            <Input
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Contact number">
            <Input
              placeholder="09XX-XXX-XXXX"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </Field>
          <Field label="Barangay of residence">
            <BarangaySelect />
          </Field>
          <Field label="Role">
            <Select defaultValue="citizen">
              <option value="citizen">Citizen / Family member</option>
            </Select>
          </Field>
          <Field label="Password">
            <Input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && (
            <div className="bg-red-50 border border-[#F3C6C6] text-danger text-xs font-semibold rounded-md px-3.5 py-2.5 mb-2">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={handleCreateAccount}
            variant="primary"
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-xs text-ink-400 mt-5 leading-relaxed">
            By creating an account, you agree to TraceNet&rsquo;s{" "}
            <span className="link-inline">Terms &amp; Conditions</span> and{" "}
            <span className="link-inline">Data Privacy Policy</span>.
          </p>
        </form>

        <p className="text-center text-sm text-ink-700 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="link-inline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-ink-400 mt-3">
          <Link href="/dashboard" className="hover:text-ink-700">← Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}
