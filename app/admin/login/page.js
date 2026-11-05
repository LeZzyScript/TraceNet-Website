"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";
import { friendlyAuthError, signInForPortal } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  // Figure 33.1 sample values are only prefilled in demo mode.
  const [email, setEmail] = useState(
    isFirebaseConfigured ? "" : "Adm. Rosa Flores — rosa@admin.gov"
  );
  const [password, setPassword] = useState(isFirebaseConfigured ? "" : "••••••••••••");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      router.push("/admin");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await signInForPortal(email, password, "admin");
      router.push("/admin");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E2646] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Top Navy Header Block matching Figure 33.1 (Admin Portal Login) */}
        <div className="bg-[#122E54] pt-7 pb-6 px-8 text-center">
          <div className="w-11 h-11 rounded-lg bg-[#2563EB] mx-auto mb-3 flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-base tracking-tight">
            TraceNet Admin Portal
          </h1>
          <p className="text-[#94A3B8] text-[11px] mt-1">
            System Governance &amp; User Administration
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-7 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#334155] mb-1.5">
              Admin ID / Email
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
              className="w-full bg-[#1967D2] hover:bg-[#1557B0] disabled:opacity-60 text-white font-bold text-xs py-3 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign In to Admin Console"}
            </button>
            {isFirebaseConfigured && (
              <Link
                href="/admin"
                className="mt-3 block text-center text-[11px] font-semibold text-slate-400 hover:text-[#1967D2]"
              >
                Continue in demo mode (sample data)
              </Link>
            )}
          </div>

          <p className="text-center text-[10px] text-[#94A3B8] pt-1">
            All administrative actions are logged under RA 10173 compliance
          </p>
        </form>
      </div>
    </div>
  );
}

