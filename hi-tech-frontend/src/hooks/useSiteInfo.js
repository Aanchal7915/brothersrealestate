import { useContext, useMemo } from "react";
import { CompanySettingsContext } from "../context/CompanySettingsContext";
import { SITE } from "../config/site";

const WHATSAPP_TEXT =
  "Hi, I found you on Brothers Real Estate and would like to enquire about a property.";

/**
 * Builds a wa.me URL.
 * - With projectName: pre-fills the property-specific message.
 * - Without: uses the generic enquiry message.
 */
export const buildWhatsAppUrl = (whatsappDigits, projectName) => {
  const digits = String(whatsappDigits || "").replace(/\D/g, "");
  if (!digits) return "#";
  const text = projectName
    ? `Hi, I am interested in ${projectName}. Please share the latest price and availability.`
    : WHATSAPP_TEXT;
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
};

const tenDigits = (v) => {
  const digits = String(v || "").replace(/\D/g, "");
  return digits.length === 10 ? digits : "";
};

// Admins commonly type "facebook.com/xyz" without a protocol — as a plain
// <a href>, that's a RELATIVE link (it navigates within this site instead of
// out to Facebook). Prefix https:// whenever one isn't already there.
const withProtocol = (v) => {
  const trimmed = String(v || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

/**
 * Live contact details for the public site — Company Settings (admin-edited,
 * requirements doc section 13) override the static config/site.js defaults
 * field by field, so a business that hasn't filled in Company Settings yet
 * still gets the original values instead of blanks.
 */
export default function useSiteInfo() {
  const { settings } = useContext(CompanySettingsContext);

  return useMemo(() => {
    const phoneDigits = tenDigits(settings.phone);
    const whatsappDigits = tenDigits(settings.whatsapp);

    return {
      name: SITE.name,
      tagline: SITE.tagline,
      servingSince: SITE.servingSince,
      phoneDisplay: phoneDigits
        ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
        : SITE.phoneDisplay,
      phoneHref: phoneDigits ? `tel:+91${phoneDigits}` : SITE.phoneHref,
      whatsappHref: whatsappDigits
        ? `https://wa.me/91${whatsappDigits}?text=${encodeURIComponent(WHATSAPP_TEXT)}`
        : SITE.whatsappHref,
      email: settings.email?.trim() || SITE.email,
      address: settings.address?.trim() || SITE.address,
      rera: settings.rera?.trim() || "",
      facebookUrl: withProtocol(settings.facebookUrl),
      instagramUrl: withProtocol(settings.instagramUrl),
      linkedinUrl: withProtocol(settings.linkedinUrl),
      youtubeUrl: withProtocol(settings.youtubeUrl),
      // The link "View on Google Maps" opens directly — whatever the admin
      // pastes (a share link, a place link, anything) works fine as a plain
      // link, even when it can't be embedded.
      googleMapsUrl: withProtocol(settings.googleMapsUrl),
      // The embedded iframe is always built from the office address instead
      // of the pasted link: most Google Maps "Share" links (short share.
      // google links, place links) refuse to load inside an iframe at all,
      // where an address-based query reliably renders every time.
      mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(
        settings.address?.trim() || SITE.address
      )}&output=embed`,
      // "View on Google Maps" link next to the embed — opens the admin's
      // real pasted link when there is one, otherwise a normal (non-embed)
      // maps search for the address so the link is never dead.
      googleMapsViewUrl:
        withProtocol(settings.googleMapsUrl) ||
        `https://www.google.com/maps?q=${encodeURIComponent(
          settings.address?.trim() || SITE.address
        )}`,
    };
  }, [settings]);
}
