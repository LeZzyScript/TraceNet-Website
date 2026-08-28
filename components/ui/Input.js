export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-ink-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClasses =
  "w-full border-[1.6px] border-line bg-white rounded-sm px-3.5 py-3 text-sm text-ink-900 font-medium placeholder:text-ink-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500";

export function Input(props) {
  return <input className={fieldClasses} {...props} />;
}

export function Textarea(props) {
  return <textarea className={`${fieldClasses} h-24 resize-none`} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={fieldClasses} {...props}>
      {children}
    </select>
  );
}

/**
 * File upload — replaces the mobile app's camera capture. Citizens on web
 * can only attach an existing photo (from their device or a photo they
 * already took), not capture live from a webcam.
 */
export function FileUpload({ label = "Upload photo", hint }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 w-full border-[1.6px] border-dashed border-[#B9C8E6] bg-[#EDF3FC] rounded-md py-8 px-4 cursor-pointer text-center hover:bg-[#E4EDFB] transition-colors">
      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm text-lg">
        📷
      </span>
      <span className="text-sm font-bold text-ink-900">{label}</span>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
      <input type="file" accept="image/*" className="hidden" />
    </label>
  );
}
