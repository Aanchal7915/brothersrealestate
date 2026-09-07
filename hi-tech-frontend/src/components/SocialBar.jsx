import { useState } from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import useSiteInfo from "../hooks/useSiteInfo";

// Only the platforms actually filled in from the admin's Company Settings
// page show up here — nothing is hardcoded, and a platform disappears the
// moment its URL is cleared.
const PLATFORMS = [
  { key: "facebookUrl", name: "Facebook", icon: Facebook, color: "#1877F2", label: "Like us on Facebook" },
  { key: "instagramUrl", name: "Instagram", icon: Instagram, color: "#C13584", label: "Follow us on Instagram" },
  { key: "linkedinUrl", name: "LinkedIn", icon: Linkedin, color: "#0A66C2", label: "Connect on LinkedIn" },
  { key: "youtubeUrl", name: "YouTube", icon: Youtube, color: "#FF0000", label: "Subscribe on YouTube" },
];

const SocialBar = () => {
  const site = useSiteInfo();
  const [activeLink, setActiveLink] = useState(null);

  const socialLinks = PLATFORMS.filter((p) => site[p.key]).map((p) => ({
    ...p,
    href: site[p.key],
  }));

  if (socialLinks.length === 0) return null;

  const handleLinkClick = (e, link) => {
    // First tap on touch shows the label, second tap follows the link.
    if (activeLink === link.name) {
      setActiveLink(null);
    } else {
      e.preventDefault();
      setActiveLink(link.name);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex flex-col gap-3 md:gap-4">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          const isHovered = activeLink === link.name;

          return (
            <div key={link.name} className="relative group flex items-center justify-end">
              {/* Hover Label (Pill Shape) */}
              <div className="flex items-center overflow-hidden">
                <span
                  style={{ backgroundColor: "white", color: link.color }}
                  className={`py-2 px-3.5 text-sm whitespace-nowrap transition-all duration-500 ease-out rounded-full shadow-lg mr-[-2px] ${
                    isHovered ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                  } md:group-hover:translate-x-0 md:group-hover:opacity-100`}
                >
                  {link.label}
                </span>
              </div>

              {/* Icon Button (Fully Round) */}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                style={{ backgroundColor: link.color }}
                onClick={(e) => handleLinkClick(e, link)}
                className={`p-3 md:p-3 rounded-full shadow-lg transition-all duration-500 ease-out block hover:shadow-2xl relative z-10 ${
                  isHovered ? "-translate-x-3" : ""
                } md:group-hover:-translate-x-3`}
              >
                <Icon size={18} className="w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-500 group-hover:scale-110" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialBar;
