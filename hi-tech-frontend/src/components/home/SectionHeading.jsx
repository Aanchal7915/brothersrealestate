import Reveal from "./Reveal";

/**
 * Shared section header: small uppercase eyebrow, display title,
 * optional supporting line and a right-aligned action slot.
 *
 * Each part reveals on its own short delay so the header reads
 * top-to-bottom rather than snapping in as one block.
 */
const SectionHeading = ({ eyebrow, title, subtitle, action, align = "left" }) => {
  const centered = align === "center";

  return (
    <div
      className={`mb-8 gap-4 sm:mb-10 ${
        centered
          ? "flex flex-col items-center text-center"
          : "flex flex-col sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <Reveal variant="up" duration={600}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dark sm:text-xs">
              {eyebrow}
            </p>
          </Reveal>
        )}

        <Reveal variant="up" delay={90} duration={700}>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-matte sm:text-3xl lg:text-[2rem]">
            {title}
          </h2>
        </Reveal>

        {subtitle && (
          <Reveal variant="up" delay={190} duration={700}>
            <p className="mt-2.5 text-sm leading-relaxed text-matte/55 sm:text-[15px]">
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>

      {action && (
        <Reveal variant="up" delay={280} duration={700} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
};

export default SectionHeading;
