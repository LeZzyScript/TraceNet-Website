import Image from "next/image";
import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/Input";
import BarangaySelect from "@/components/ui/BarangaySelect";
import Button from "@/components/ui/Button";

export default function SignUpPage() {
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
            <Input placeholder="Juan dela Cruz" />
          </Field>
          <Field label="Email address">
            <Input type="email" placeholder="juan@example.com" />
          </Field>
          <Field label="Contact number">
            <Input placeholder="09XX-XXX-XXXX" />
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
            <Input type="password" placeholder="••••••••••" />
          </Field>

          <Button href="/dashboard" variant="primary" className="w-full mt-2">
            Create account
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
