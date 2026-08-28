import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-line">
      <div className="container-page flex items-center justify-between h-[72px]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="TraceNet" width={36} height={36} className="rounded-[10px]" />
          <span className="font-head font-extrabold text-lg text-navy-900">
            TraceNet
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink-700">
          <a href="#how-it-helps" className="hover:text-navy-900">Capabilities</a>
          <a href="#coverage" className="hover:text-navy-900">Coverage</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button href="/sign-in" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/sign-up" variant="primary">
            Create account
          </Button>
        </div>
      </div>
    </header>
  );
}
