import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container-page py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Image src="/logo-icon.png" alt="TraceNet" width={30} height={30} className="rounded-[8px]" />
            <span className="font-head font-extrabold text-white text-base">TraceNet</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            AI-assisted missing person reporting and case coordination for
            Cebu City — built for citizens, barangays, and the CCPO.
          </p>
        </div>

        <div>
          <div className="text-white text-sm font-bold mb-3">Platform</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/sign-up" className="hover:text-white">Create an account</a></li>
            <li><a href="/sign-in" className="hover:text-white">Sign in</a></li>
            <li><a href="#coverage" className="hover:text-white">Coverage area</a></li>
          </ul>
        </div>

        <div>
          <div className="text-white text-sm font-bold mb-3">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Terms &amp; Conditions</a></li>
            <li><a href="#" className="hover:text-white">Data Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TraceNet — Cebu City Police Office coordination platform.
      </div>
    </footer>
  );
}
