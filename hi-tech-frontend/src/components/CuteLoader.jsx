import { Home } from "lucide-react";

/**
 * Empty / waiting state used where a section has nothing to show yet.
 * Same champagne-gold language as the main Loader, just with a message.
 */
const CuteLoader = ({
  text = "We're curating the finest spaces for you.",
  title = "Nothing here just yet",
  // `tone: "dark"` so the same state reads correctly on the matte sections.
  tone = "light",
  children,
}) => (
  <div
    role="status"
    aria-live="polite"
    className="flex w-full flex-col items-center justify-center px-4 py-16 text-center"
  >
    <span className="relative mb-7 flex h-16 w-16 items-center justify-center">
      <span className="absolute inset-0 rotate-45 border border-gold/35" aria-hidden="true" />
      <Home size={24} strokeWidth={1.2} className="text-gold" />
    </span>

    <h3
      className={`font-serif text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl ${
        tone === "dark" ? "text-white" : "text-matte"
      }`}
    >
      {title}
    </h3>

    <span aria-hidden="true" className="mt-4 flex items-center gap-2">
      <span className="h-px w-8 bg-gold/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-8 bg-gold/60" />
    </span>

    <p
      className={`mx-auto mt-5 max-w-sm text-sm leading-[1.9] ${
        tone === "dark" ? "text-white/55" : "text-matte/55"
      }`}
    >
      {text}
    </p>

    {children && <div className="mt-8">{children}</div>}
  </div>
);

export default CuteLoader;
