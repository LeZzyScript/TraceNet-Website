export function Card({ className = "", children }) {
  return (
    <div
      className={`bg-white border border-line rounded-md shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="text-xs font-extrabold uppercase tracking-wide text-ink-900 mb-3">
      {children}
    </div>
  );
}
