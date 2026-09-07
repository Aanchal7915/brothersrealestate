import { Phone, MessageCircle, Send } from "lucide-react";
import useSiteInfo from "../hooks/useSiteInfo";
import { buildWhatsAppUrl } from "../hooks/useSiteInfo";
import trackEvent from "../utils/trackEvent";

/**
 * Fixed bottom Call / WhatsApp / Enquire bar — mobile only (requirements doc
 * section 11). "Enquire" routes to the Contact page's enquiry form rather
 * than opening a duplicate modal, since every page already funnels enquiries
 * there or through its own on-page form.
 */
const MobileActionBar = ({ setCurrentPage, projectName }) => {
  const site = useSiteInfo();
  const whatsappDigits = site.whatsappHref?.match(/wa\.me\/(\d+)/)?.[1] || "91000000";
  const whatsappUrl = buildWhatsAppUrl(whatsappDigits, projectName);

  return (
  <nav
    aria-label="Quick contact"
    className="fixed inset-x-0 bottom-0 z-[190] grid grid-cols-3 border-t border-black/10 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden"
    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
  >
    <a
      href={site.phoneHref}
      onClick={() => trackEvent("call_click", { source: "mobile-action-bar" })}
      className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-matte transition-colors active:bg-gray-50"
    >
      <Phone size={19} strokeWidth={1.6} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">Call</span>
    </a>
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("whatsapp_click", { source: "mobile-action-bar", project: projectName })}
      className="flex flex-col items-center justify-center gap-0.5 border-x border-black/10 bg-[#1e9e57] py-2.5 text-white transition-colors active:bg-[#178048]"
    >
      <MessageCircle size={19} strokeWidth={1.6} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">WhatsApp</span>
    </a>
    <button
      onClick={() => setCurrentPage("contact")}
      className="flex flex-col items-center justify-center gap-0.5 bg-gold py-2.5 text-matte transition-colors active:bg-gold-light"
    >
      <Send size={19} strokeWidth={1.6} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em]">Enquire</span>
    </button>
  </nav>
  );
};

export default MobileActionBar;
