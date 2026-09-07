import useReveal from "../../hooks/useReveal";

/**
 * Scroll-triggered entrance wrapper.
 *
 * Animates opacity + transform only (compositor-friendly, no layout shift —
 * the element occupies its final box from first paint).
 * `useReveal` reveals immediately when prefers-reduced-motion is set.
 *
 * variant: "up" | "down" | "left" | "right" | "scale" | "fade"
 * delay:   stagger in ms
 */
const HIDDEN = {
  up: "opacity-0 translate-y-6",
  down: "opacity-0 -translate-y-6",
  left: "opacity-0 -translate-x-8",
  right: "opacity-0 translate-x-8",
  scale: "opacity-0 scale-[0.96]",
  fade: "opacity-0",
};

const Reveal = ({
  children,
  delay = 0,
  variant = "up",
  duration = 700,
  className = "",
  as: Tag = "div",
}) => {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      // `reveal-anim` lets the stylesheet cancel the sideways part of the
      // entrance on phones — a 32px slide-in from the right pushed the whole
      // page wider than the screen until the animation finished.
      className={`reveal-anim will-change-[opacity,transform] motion-reduce:transition-none ${
        visible
          ? "opacity-100 translate-x-0 translate-y-0 scale-100"
          : HIDDEN[variant] || HIDDEN.up
      } ${className}`}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(.22,.61,.36,1)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
