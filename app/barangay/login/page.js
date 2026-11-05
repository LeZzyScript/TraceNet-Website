"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";
import { friendlyAuthError, signInForPortal } from "@/lib/auth";

export default function BarangayLoginPage() {
  const router = useRouter();
  // Figure 30.1 sample values are only prefilled in demo mode.
  const [email, setEmail] = useState(
    isFirebaseConfigured ? "" : "Barangay Official — brgy.lahug@cebu.gov.ph"
  );
  const [password, setPassword] = useState(isFirebaseConfigured ? "" : "••••••••••••");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      router.push("/barangay/dashboard");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await signInForPortal(email, password, "barangay");
      router.push("/barangay/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-xl shadow-xl overflow-hidden border border-[#E2E8F0]">
        {/* Header block matching Figure 30.1 (Barangay Official Login) */}
        <div className="pt-8 pb-5 px-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#1967D2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
            </svg>
          </div>
          <h1 className="text-[#0B2240] font-bold text-base tracking-tight">
            Barangay Official Portal
          </h1>
          <p className="text-[#64748B] text-[11px] mt-1">
            Brgy. Labangon / Lahug — Cebu City
          </p>
        </div>

        {/* Form body */}
        <form onSubmit={handleLogin} className="px-7 pb-7 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#334155] mb-1.5">
              Official ID / Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-[#1E293B] bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#1967D2]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#334155] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-[#1E293B] bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#1967D2]"
            />
          </div>

          <div className="pt-1">
            {error && (
              <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1967D2] hover:bg-[#1557B0] disabled:opacity-60 text-white font-bold text-xs py-3 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign In to Barangay Portal"}
            </button>
            {isFirebaseConfigured && (
              <Link
                href="/barangay/dashboard"
                className="mt-3 block text-center text-[11px] font-semibold text-slate-400 hover:text-[#1967D2]"
              >
                Continue in demo mode (sample data)
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

