import { useEffect, useRef, useState } from "react";
import { Send, User, Phone, MessageSquare, X } from "lucide-react";

/**
 * Appears once, 60s after load, and hands the enquiry off to WhatsApp.
 * Styled to match the site's contact form.
 */
export default function TimedWhatsAppPopup({ phone = "+911234567899" }) {
  const [visible, setVisible] = useState(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const messageRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("waPopupShown")) return;
    const timeout = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("waPopupShown", "true");
    }, 60000);
    return () => clearTimeout(timeout);
  }, []);

  // Focus the first field, close on Escape, and lock background scroll.
  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setVisible(false);
    };

    const raf = requestAnimationFrame(() => {
      try {
        nameRef.current?.focus();
      } catch (e) {
        /* ignore */
      }
    });

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  const handleClose = () => setVisible(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = (nameRef.current?.value || "").trim();
    const userPhone = (phoneRef.current?.value || "").trim();
    const msg = (messageRef.current?.value || "").trim();

    const finalText = `Name: ${name}\nPhone: ${userPhone}\nMessage: ${msg}`;
    const cleaned = phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${cleaned}?text=${encodeURIComponent(finalText)}`,
      "_blank"
    );
    setVisible(false);
  };

  if (!visible) return null;

  const fieldClass =
    "w-full rounded-xl border border-black/10 bg-white py-3 pl-14 pr-4 text-sm text-matte outline-none transition-all duration-200 placeholder:text-matte/45 focus:border-matte focus:ring-4 focus:ring-matte/10";

  const Icon = ({ icon: I, align = "center" }) => (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-2 flex h-9 w-9 items-center justify-center rounded-lg bg-ivory text-matte ${
        align === "top" ? "top-2" : "top-1/2 -translate-y-1/2"
      }`}
    >
      <I size={16} />
    </span>
  );

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop — click to dismiss */}
      <div
        className="ce-backdrop-in absolute inset-0 bg-matte/55 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-enquiry-title"
        className="ce-modal-in relative my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-float"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/10 bg-ivory px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
              <Send size={18} />
            </span>
            <div className="min-w-0">
              <h2
                id="quick-enquiry-title"
                className="font-display text-[15px] font-extrabold leading-tight text-matte"
              >
                Send a Request
              </h2>
              <p className="mt-0.5 text-xs text-matte/55">
                Connect with our advisor
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-matte/55 transition-colors hover:bg-ivory hover:text-matte"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          <div className="relative">
            <Icon icon={User} />
            <input
              ref={nameRef}
              required
              type="text"
              aria-label="Your name"
              className={fieldClass}
              placeholder="Your name"
            />
          </div>

          <div className="relative">
            <Icon icon={Phone} />
            <input
              ref={phoneRef}
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              aria-label="Mobile number"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              }}
              className={fieldClass}
              placeholder="Mobile number"
            />
          </div>

          <div className="relative">
            <Icon icon={MessageSquare} align="top" />
            <textarea
              ref={messageRef}
              rows={3}
              aria-label="Your message"
              className={`${fieldClass} resize-y`}
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-matte text-sm font-bold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-12px_rgba(193,162,101,0.65)] active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
          >
            <Send
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
            Send on WhatsApp
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-1 text-center text-xs font-semibold text-matte/55 transition-colors hover:text-matte"
          >
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
