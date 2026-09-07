/**
 * Fires a conversion event to both GA4 (gtag) and Meta Pixel (fbq) — both are
 * already loaded globally in index.html. Requirements doc section 16: track
 * enquiry submissions, WhatsApp clicks, Call clicks, and brochure requests.
 * Safe to call anywhere; no-ops silently if a script hasn't loaded yet (an
 * ad-blocker, or the page loaded before the tag finished).
 */
export default function trackEvent(name, params = {}) {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  } catch (e) {
    /* ignore */
  }
  try {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", name, params);
    }
  } catch (e) {
    /* ignore */
  }
}
