import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm px-6 py-3 transition-transform active:scale-[.98]";

const variants = {
  primary: "bg-brand-600 text-white shadow-button hover:bg-brand-500",
  outline: "bg-white border-[1.6px] border-brand-600 text-brand-600 hover:bg-brand-100",
  ghost: "bg-transparent text-navy-900 hover:bg-black/5",
  onDark:
    "bg-white/10 border-[1.6px] border-white/30 text-white hover:bg-white/20",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
