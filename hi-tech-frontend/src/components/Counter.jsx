import { useEffect, useRef, useState } from "react";

export default function Counter({ value, duration = 3500, className = "" }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const hasStarted = useRef(false);

  // parse numeric part and suffix (like +)
  const match = String(value).match(/(\d+[\d,]*)\s*(\+)?/);
  const numeric = match ? Number(match[1].replace(/,/g, "")) : 0;
  const suffix = match && match[2] ? "+" : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          // animate
          const start = performance.now();
          const from = 0;

          const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const current = Math.floor(from + (numeric - from) * progress);
            setDisplay(current.toLocaleString());
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplay(numeric.toLocaleString() + suffix);
            }
          };

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    };

    const obs = new IntersectionObserver(onIntersect, { threshold: 0.3 });
    obs.observe(el);

    return () => obs.disconnect();
  }, [numeric, duration, suffix]);

  return (
    <div ref={ref} className={className} aria-hidden>
      {display}
    </div>
  );
}
