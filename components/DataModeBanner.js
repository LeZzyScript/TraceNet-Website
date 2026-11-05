import Link from "next/link";

/**
 * Tells the viewer whether they are looking at live Firestore data or the
 * built-in demo data, so demo numbers are never mistaken for real cases.
 */
export default function DataModeBanner({
  live,
  loading,
  error,
  configured,
  loginHref,
  authLoading,
}) {
  if (authLoading) return null;

  if (error) {
    return (
      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (live) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {loading
          ? "Connecting to live data…"
          : "Live — synced in real time with the TraceNet mobile app"}
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
      <span>
        Demo data — these are sample cases, not real reports.
        {!configured && " (Firebase is not configured in .env.local.)"}
      </span>
      {configured && loginHref && (
        <Link href={loginHref} className="font-bold text-[#1967D2] hover:underline">
          Sign in for live data →
        </Link>
      )}
    </div>
  );
}

