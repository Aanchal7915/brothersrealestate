import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 up to the numeric part of `value`, once, when scrolled into view.
 * Preserves any prefix/suffix: "5000+" → 0…5000 then "+", "₹12L" → "₹" + 0…12 + "L".
 *
 * Uses a single rAF loop driving one text node — no layout thrash.
 * Honours prefers-reduced-motion by rendering the final value immediately.
 */

// easeOutExpo — fast start, long gentle settle
const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const parse = (value) => {
  const match = String(value).match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/s);
  if (!match) return { prefix: "", target: null, suffix: "", decimals: 0 };
  const raw = match[2].replace(/,/g, "");
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return {
    prefix: match[1] ?? "",
    target: Number(raw),
    suffix: match[3] ?? "",
    decimals,
  };
};

const CountUp = ({ value, duration = 1800, className = "" }) => {
  const { prefix, target, suffix, decimals } = parse(value);
  const ref = useRef(null);
  const started = useRef(false);
  const [shown, setShown] = useState(target === null ? null : 0);

  useEffect(() => {
    // Non-numeric values (or nothing to animate) render as-is.
    if (target === null) return;

    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(target);
      return;
    }

    let frame;
    const run = () => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setShown(target * ease(p));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            run();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  if (target === null) {
    return <span className={className}>{value}</span>;
  }

  const display =
    decimals > 0
      ? shown.toFixed(decimals)
      : Math.round(shown).toLocaleString("en-IN");

  return (
    // The full value is announced once; the ticking text is hidden from AT.
    <span ref={ref} className={className} aria-label={String(value)} role="text">
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
};

export default CountUp;
