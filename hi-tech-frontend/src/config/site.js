// Single source of truth for Brothers Realestate contact details and navigation.
// Values mirror what the live site already publishes — update here, not per-component.

export const SITE = {
  name: "Brothers Realestate",
  tagline: "Find • Invest • Live Better",
  phoneDisplay: "+91-123456 7899",
  phoneHref: "tel:+911234567899",
  whatsappHref:
    "https://wa.me/911234567899?text=Hi%2C%20I%20found%20you%20on%20Brothers%20Estate%20and%20would%20like%20to%20enquire%20about%20a%20property.",
  email: "info@brothersestate.com",
  address: "1st floor alt.f MPD Tower, Sector 43, Gurugram, Haryana 122009",
  servingSince: "Serving from last 15 years",
};

// Public navigation. `page` maps to App.jsx's currentPage switch.
// `scrollTo` (optional) is a DOM id on the home page.
export const NAV_LINKS = [
  { name: "Home", page: "home" },
  { name: "About Us", page: "about" },
  // Everything added through the admin's "Add Property"
  { name: "All Properties", page: "listings" },
  // The Featured Listing collection, managed on its own admin page
  { name: "Featured Listing", page: "featured-listing" },
  // Same "All Properties" data (added via Add Property), pre-filtered to the
  // Land property type — replaces the old Rental Properties nav slot.
  { name: "Land", page: "land-listings" },
  // Rental replaced by Land — commented out, not removed, so the rental
  // pages/admin panel still work if reached directly; just not linked here.
  // { name: "Rental Properties", page: "rental-listings" },
  { name: "Contact", page: "contact" },
];

export const FOOTER_LINKS = {
  quick: NAV_LINKS,
  services: [
    "Residential",
    "Commercial",
    "Investments",
    "Consultancy",
    "Legal Support",
  ],
  locations: ["Gurgaon", "New Delhi", "Noida", "Faridabad", "Sohna Road"],
  legal: [
    { name: "Privacy Policy", page: "privacy-policy" },
    { name: "Terms & Conditions", page: "terms-conditions" },
  ],
};

// Business stats as published on the existing site.
export const STATS = [
  { value: "5000+", label: "Happy Clients" },
  { value: "100+", label: "Curated Projects" },
  { value: "30+", label: "Top Developers" },
  { value: "15+", label: "Years Experience" },
];
