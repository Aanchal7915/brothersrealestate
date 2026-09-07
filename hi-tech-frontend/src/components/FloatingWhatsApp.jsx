import { useState } from "react";
import useSiteInfo from "../hooks/useSiteInfo";
import { buildWhatsAppUrl } from "../hooks/useSiteInfo";
import trackEvent from "../utils/trackEvent";

export default function FloatingWhatsApp({ projectName }) {
  const [open, setOpen] = useState(false);
  const site = useSiteInfo();
  const whatsappDigits = site.whatsappHref?.match(/wa\.me\/(\d+)/)?.[1] || "911234567899";
  const url = buildWhatsAppUrl(whatsappDigits, projectName);

  return (
    <>
      {/* Optional floating panel (not used now) */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "95px",
            width: "320px",
            maxWidth: "90vw",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
            zIndex: 99999,
            overflow: "hidden",
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>WhatsApp</strong>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#0b8457", fontWeight: 600 }}>
              Start WhatsApp chat →
            </a>
          </div>
        </div>
      )}

      {/* Floating WhatsApp button (positioned above AI chat, with float animation) */}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("whatsapp_click", { source: "floating-button" })}
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          // Offsets live in CSS vars so the phone breakpoint can shrink the
          // pair and keep them aligned with the chatbot button below.
          bottom: "var(--fab-stack-bottom, 100px)",
          right: "var(--fab-right, 20px)",
          zIndex: 200000,
          width: "var(--fab-size, 56px)",
          height: "var(--fab-size, 56px)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#25D366",
          color: "white",
          border: "none",
          boxShadow: "0 10px 30px rgba(37,211,102,0.35)",
          textDecoration: "none",
          transform: "translateY(0)",
        }}
      >
        {/* SVG WhatsApp icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="55%" height="55%" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
