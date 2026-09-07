/**
 * Thin champagne-gold rule with a centred diamond.
 * `align` controls whether it sits left or centred under a heading.
 */
const GoldDivider = ({ align = "left", className = "", tone = "gold", style }) => {
  const line = tone === "light" ? "bg-gold/50" : "bg-gold/60";
  const dot = tone === "light" ? "bg-gold-light" : "bg-gold";

  return (
    <span
      aria-hidden="true"
      style={style}
      className={`flex items-center gap-2 ${
        align === "center" ? "justify-center" : "justify-start"
      } ${className}`}
    >
      <span className={`h-px w-10 ${line}`} />
      <span className={`h-1.5 w-1.5 rotate-45 ${dot}`} />
      <span className={`h-px w-10 ${line}`} />
    </span>
  );
};

export default GoldDivider;
