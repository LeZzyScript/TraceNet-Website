import Image from "next/image";
import Link from "next/link";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignInPage() {
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
          <Button href="/dashboard" variant="primary" className="w-full">
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
