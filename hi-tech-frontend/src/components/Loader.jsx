/**
 * Minimal champagne-gold ring spinner.
 * Deliberately quiet — a single thin ring with a letterspaced label,
 * matching the site's luxury type treatment.
 */
const Loader = ({ label = "Loading" }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[14rem] w-full flex-col items-center justify-center gap-5 px-6 py-10"
  >
    <span className="relative flex h-14 w-14 items-center justify-center">
      {/* track */}
      <span className="absolute inset-0 rounded-full border-2 border-gold/20" />
      {/* sweep */}
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:0.9s] motion-reduce:animate-none" />
      {/* centre mark */}
      <span className="h-1.5 w-1.5 rotate-45 bg-gold/70" aria-hidden="true" />
    </span>

    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-matte/55">
      {label}
    </span>
  </div>
);

export default Loader;
