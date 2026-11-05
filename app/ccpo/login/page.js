"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase";
import { friendlyAuthError, signInForPortal } from "@/lib/auth";

export default function CCPOLoginPage() {
  const router = useRouter();
  // Manuscript Figure 23 shows these sample values; they are only prefilled in
  // demo mode. With Firebase configured the officer types real credentials.
  const [badgeEmail, setBadgeEmail] = useState(
    isFirebaseConfigured ? "" : "PO2 dela Cruz — ccpo@cebu.gov.ph"
  );
  const [password, setPassword] = useState(isFirebaseConfigured ? "" : "••••••••••••");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCommandSignIn(e) {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      router.push("/ccpo/dashboard");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await signInForPortal(badgeEmail, password, "ccpo");
      router.push("/ccpo/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0E2646] px-4 py-12">
      {/* Centered White Card with Dark Navy Header Block (Exact Figure 23 p. 86) */}
      <div className="w-full max-w-[380px] bg-white rounded-xl shadow-2xl overflow-hidden border border-white/10">
        {/* Top Navy Header Block with Shield Icon */}
        <div className="bg-[#122E54] py-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#1967D2] border border-white/20 flex items-center justify-center shadow-md">
            <span className="text-white text-xl">🛡️</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-7 pt-5 pb-6">
          <div className="text-center mb-5">
            <h1 className="font-head font-extrabold text-base text-[#0B2240]">
              TraceNet CCPO Portal
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cebu City Police Office — Command Access
            </p>
          </div>

          <form onSubmit={handleCommandSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Badge Number / Email
              </label>
              <input
                type="text"
                value={badgeEmail}
                onChange={(e) => setBadgeEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#0B2240] bg-[#F8FAFC] border border-slate-200 rounded-md focus:outline-none focus:border-[#1967D2]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#0B2240] bg-[#F8FAFC] border border-slate-200 rounded-md focus:outline-none focus:border-[#1967D2]"
                required
              />
            </div>

            <div className="pt-2">
              {error && (
                <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-full bg-[#1967D2] hover:bg-[#1454B0] disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-colors"
              >
                {submitting ? "Signing in…" : "Sign In to Command"}
              </button>
              {isFirebaseConfigured && (
                <Link
                  href="/ccpo/dashboard"
                  className="mt-3 block text-center text-[11px] font-semibold text-slate-400 hover:text-[#1967D2]"
                >
                  Continue in demo mode (sample data)
                </Link>
              )}
            </div>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            Unauthorized access is prohibited and monitored
          </p>
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 text-center">
        <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
          ← Return to TraceNet Home
        </Link>
      </div>
    </main>
  );
}
