"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSignIn() {
    // No backend/database yet — check the local demo-account flag set by
    // the Create account page instead of a real credential check.
    const hasAccount = window.localStorage.getItem("tracenet_demo_account") === "true";
    if (hasAccount) {
      setError("");
      router.push("/dashboard");
    } else {
      setError("No account found on this device yet. Please create an account first.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-icon.png" alt="TraceNet" width={52} height={52} className="rounded-2xl shadow-card" />
          <h1 className="font-head font-extrabold text-2xl text-navy-900 mt-4">
            Welcome back
          </h1>
          <p className="text-sm text-ink-500 mt-1">Sign in to TraceNet</p>
        </div>

        <form className="bg-white border border-line rounded-lg shadow-card p-8">
          <Field label="Email / phone number">
            <Input placeholder="juan@example.com" />
          </Field>
          <Field label="Password">
            <Input type="password" placeholder="••••••••" />
          </Field>
          <div className="text-right -mt-2 mb-5">
            <span className="link-inline text-xs">Forgot password?</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-[#F3C6C6] text-danger text-xs font-semibold rounded-md px-3.5 py-2.5 mb-4">
              {error}
            </div>
          )}

          <Button type="button" onClick={handleSignIn} variant="primary" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-ink-700 mt-6">
          Don&rsquo;t have an account?{" "}
          <Link href="/sign-up" className="link-inline">Create one</Link>
        </p>
        <p className="text-center text-xs text-ink-400 mt-3">
          <Link href="/dashboard" className="hover:text-ink-700">← Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}
