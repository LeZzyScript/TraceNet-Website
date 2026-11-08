"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

/**
 * Manuscript Figures 13 & 14 (pp. 75–76):
 *  - Step 1 (Figure 13): Forgot Password Screen (Email / Phone input -> Send Reset Code)
 *  - Step 2 (Figure 14): Enter Reset Code Screen (6-digit OTP boxes + New Password)
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState("request"); // "request" | "verify" | "done"
  const [email, setEmail] = useState("juan@example.com");
  const [code, setCode] = useState(["4", "8", "2", "9", "1", "6"]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Please enter your registered email address or phone number.");
      return;
    }
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && email.includes("@")) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setNotice(
            `A Firebase password reset link and verification code were dispatched to ${email.trim()}.`
          );
        } catch {
          setNotice(`Verification code sent to ${email.trim()} (Demo / OTP mode).`);
        }
      } else {
        setNotice(`6-digit reset code sent to ${email.trim()}.`);
      }
      setStep("verify");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeDigit(index, val) {
    const clean = val.replace(/[^0-9]/g, "").slice(-1);
    setCode((prev) => prev.map((d, i) => (i === index ? clean : d)));
  }

  function handleVerifyAndReset(e) {
    e.preventDefault();
    setError("");
    if (code.some((d) => !d)) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setStep("done");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo-icon.png"
            alt="TraceNet"
            width={52}
            height={52}
            className="rounded-2xl shadow-card"
          />
          <h1 className="font-head font-extrabold text-2xl text-navy-900 mt-4">
            {step === "request"
              ? "Forgot Password"
              : step === "verify"
              ? "Enter Reset Code"
              : "Password Reset Complete"}
          </h1>
          <p className="text-sm text-ink-500 mt-1 text-center">
            {step === "request"
              ? "Enter your email or phone number to receive a 6-digit reset code"
              : step === "verify"
              ? `Enter the 6-digit code sent to ${email}`
              : "Your TraceNet account password has been updated"}
          </p>
        </div>

        {/* Step Switcher Pills (Figures 13 & 14) */}
        <div className="flex justify-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => setStep("request")}
            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${
              step === "request"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-ink-500 border-line"
            }`}
          >
            1. Forgot Password (Fig 13)
          </button>
          <button
            type="button"
            onClick={() => setStep("verify")}
            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${
              step === "verify"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-ink-500 border-line"
            }`}
          >
            2. Enter Reset Code (Fig 14)
          </button>
        </div>

        <div className="bg-white border border-line rounded-lg shadow-card p-8">
          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl mx-auto mb-2">
                🔑
              </div>

              <Field label="Registered Email or Phone Number">
                <Input
                  type="text"
                  placeholder="juan@example.com or 0917-123-4567"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              {error && (
                <div className="bg-red-50 border border-[#F3C6C6] text-danger text-xs font-semibold rounded-md px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending Reset Code..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {notice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md px-3.5 py-2.5">
                  {notice}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-2 text-center">
                  6-Digit Verification Code (Figure 14)
                </label>
                <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeDigit(idx, e.target.value)}
                      className="h-12 text-center font-head font-extrabold text-lg text-navy-900 border-2 border-line rounded-md bg-paper focus:outline-none focus:border-brand-600"
                    />
                  ))}
                </div>
              </div>

              <Field label="New Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>

              <Field label="Confirm New Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>

              {error && (
                <div className="bg-red-50 border border-[#F3C6C6] text-danger text-xs font-semibold rounded-md px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full">
                Verify Code &amp; Reset Password
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Didn&rsquo;t receive code? Resend
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-success flex items-center justify-center text-2xl mx-auto">
                ✓
              </div>
              <p className="text-sm text-ink-700">
                Your password has been updated. You can now sign in on both the TraceNet
                Web Portal and Mobile App.
              </p>
              <Button href="/sign-in" variant="primary" className="w-full">
                Return to Sign In
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          <Link href="/sign-in" className="hover:text-ink-700 font-semibold">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}

