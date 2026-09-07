import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import { EnquiryProvider } from "./context/EnquiryContext";
import { CategoryProvider } from "./context/CategoryContext";
import { FeaturedProjectProvider } from "./context/FeaturedProjectContext";
import { DeveloperProvider } from "./context/DeveloperContext";
import { CompanySettingsProvider } from "./context/CompanySettingsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetails from "./pages/PropertyDetails";
import ClassicPropertyDetails from "./pages/ClassicPropertyDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminProjectEnquiries from "./pages/AdminProjectEnquiries";
import RentalCategories from "./pages/RentalCategories";
import AdminFeaturedListing from "./pages/AdminFeaturedListing";
import AdminDevelopers from "./pages/AdminDevelopers";
import AdminCompanySettings from "./pages/AdminCompanySettings";
import RentalListings from "./pages/RentalListings";
import ThankYou from "./pages/ThankYou";
import ChatBot from "./components/ChatBot";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import MobileActionBar from "./components/MobileActionBar";
import SocialBar from "./components/SocialBar";
import TimedWhatsAppPopup from "./components/TimedWhatsAppPopup";
import { UserAuthProvider } from "./context/UserAuthContext";
import "./styles/index.css";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLoginHistory from "./pages/AdminLoginHistory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import { useEffect } from "react";

// Pages safe to restore on a hard refresh — i.e. ones that don't depend on
// transient in-memory state like a clicked property object.
const SAFE_RESTORE_PAGES = [
  "home",
  "listings",
  "featured-listing",
  "land-listings",
  "rental-listings",
  "about",
  "contact",
  "privacy-policy",
  "terms-conditions",
  "admin-login",
  "admin-dashboard",
  "add-property",
  "admin-enquiries",
  "admin-project-enquiries",
  "admin-rental-categories",
  "admin-featured-listing",
  "admin-developers",
  "admin-company-settings",
  "admin-analytics",
  "admin-login-history",
];

// Pages that render a record the visitor clicked. They can be restored too,
// but only when that record is still in storage — otherwise they'd render blank.
const RECORD_RESTORE_PAGES = {
  "property-details": "selectedProperty",
  "property-details-classic": "selectedProperty",
  "edit-property": "selectedPropertyId",
};

// Every admin screen shares the single "/admin" URL.
const ADMIN_PAGES = [
  "admin-login",
  "admin-dashboard",
  "add-property",
  "edit-property",
  "admin-enquiries",
  "admin-project-enquiries",
  "admin-rental-categories",
  "admin-featured-listing",
  "admin-developers",
  "admin-company-settings",
  "admin-analytics",
  "admin-login-history",
];

// Canonical URL for a page. Admin pages are deliberately absent — they have no
// public path and ride on the stored `currentPage` instead.
const PAGE_TO_PATH = {
  home: "/",
  listings: "/listings",
  "featured-listing": "/featured-listing",
  "land-listings": "/land",
  "rental-listings": "/rental-listings",
  about: "/about",
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  "terms-conditions": "/terms-conditions",
};

const pageToPath = (page, property) => {
  if (page === "property-details")
    return property?.slug || property?._id
      ? `/featured-project/${property.slug || property._id}`
      : null;
  if (page === "property-details-classic")
    return property?._id ? `/property/${property._id}` : null;
  return PAGE_TO_PATH[page] || null;
};

const pathToPage = (path) => {
  // Remove any hash prefix if present (for backward compatibility)
  if (path.startsWith("#")) path = path.slice(1);
  if (!path || path === "/") return "home";
  // The two detail layouts get their own prefixes so a refresh lands on the
  // same one the visitor was reading.
  if (path.startsWith("/featured-project/")) return "property-details";
  if (path.startsWith("/property/")) return "property-details-classic";
  if (path.startsWith("/admin"))
    return localStorage.getItem("userToken") || localStorage.getItem("token")
      ? "admin-dashboard"
      : "admin-login";
  return PATH_TO_PAGE[path] || "home";
};

const PATH_TO_PAGE = {
  "/listings": "listings",
  "/featured-listing": "featured-listing",
  "/land": "land-listings",
  "/rental-listings": "rental-listings",
  "/about": "about",
  "/contact": "contact",
  "/privacy-policy": "privacy-policy",
  "/terms-conditions": "terms-conditions",
};

const readStored = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

function App() {
  // Resolved synchronously, not in an effect: the effect that keeps the URL in
  // step with the page runs on the very first render too, and if `currentPage`
  // were still the default it would rewrite the address bar to "/" before the
  // path had been read — every deep link collapsed to the homepage.
  const [currentPage, setCurrentPage] = useState(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const saved = readStored("currentPage");
    const restorable =
      (saved && SAFE_RESTORE_PAGES.includes(saved)) ||
      // A detail page only comes back if the record it renders came back too.
      (saved && RECORD_RESTORE_PAGES[saved] && readStored(RECORD_RESTORE_PAGES[saved]))
        ? saved
        : null;
    // Every admin screen shares the one "/admin" URL, so the stored page is the
    // only thing that can tell them apart across a refresh.
    if (path.startsWith("/admin")) {
      return restorable && ADMIN_PAGES.includes(restorable) ? restorable : "admin-login";
    }
    
    // If the user visits the root domain exactly, ALWAYS show the homepage 
    // instead of restoring the last visited page.
    if (path === "/") {
      return "home";
    }

    const fromPath = pathToPage(path);
    return fromPath !== "home" ? fromPath : restorable || "home";
  });
  const [selectedProperty, setSelectedProperty] = useState(() => {
    try {
      const raw = readStored("selectedProperty");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    () => readStored("selectedPropertyId") || null
  );

  // NOTE: a second popstate listener used to live here with a shorter path map
  // that resolved every unknown path (the detail pages included) to "home". It
  // fought the listener further down, so it was dropped — that one covers the
  // full map, /admin included.

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
      case "listings":
        return (
          <Listings
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
      // Same page as "listings", pinned to the Featured Listing collection.
      case "featured-listing":
        return (
          <Listings
            featured
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
      // Same page as "listings", pre-filtered to the Land property type —
      // still sourced from every property added via Add Property, not a
      // separate collection.
      case "land-listings":
        return (
          <Listings
            propertyType="land"
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
      case "rental-listings":
        return (
          <RentalListings
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
      // The Featured Listing flow keeps its own bespoke brochure.
      case "property-details":
        return (
          <PropertyDetails
            property={selectedProperty}
            setCurrentPage={setCurrentPage}
          />
        );
      // Everything else — Premium Projects, Curated, Rentals, Locations.
      case "property-details-classic":
        return (
          <ClassicPropertyDetails
            property={selectedProperty}
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
            backTo={selectedProperty?.rentalCategory ? "rental-listings" : "listings"}
          />
        );
      case "admin-analytics":
        return (
          <AdminAnalytics
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        );
      case "about":
        return <About setCurrentPage={setCurrentPage} />;
      case "contact":
        return <Contact setCurrentPage={setCurrentPage} />;
      case "privacy-policy":
        return <PrivacyPolicy setCurrentPage={setCurrentPage} />;
      case "terms-conditions":
        return <TermsConditions setCurrentPage={setCurrentPage} />;
      case "admin-login":
        return <AdminLogin setCurrentPage={setCurrentPage} />;
      case "admin-dashboard":
        return (
          <AdminDashboard
            setCurrentPage={setCurrentPage}
            selectedPropertyId={selectedPropertyId}
            setSelectedPropertyId={setSelectedPropertyId}
          />
        );
      case "add-property":
        return (
          <AddProperty
            setCurrentPage={setCurrentPage}
            setSelectedPropertyId={setSelectedPropertyId}
          />
        );
      case "edit-property":
        return (
          <EditProperty
            setCurrentPage={setCurrentPage}
            propertyId={selectedPropertyId}
          />
        );
      case "admin-enquiries":
        return <AdminEnquiries setCurrentPage={setCurrentPage} />;
      case "admin-project-enquiries":
        return <AdminProjectEnquiries setCurrentPage={setCurrentPage} />;
      case "admin-rental-categories":
        return <RentalCategories setCurrentPage={setCurrentPage} />;
      case "admin-featured-listing":
        return <AdminFeaturedListing setCurrentPage={setCurrentPage} />;
      case "admin-developers":
        return <AdminDevelopers setCurrentPage={setCurrentPage} />;
      case "admin-company-settings":
        return <AdminCompanySettings setCurrentPage={setCurrentPage} />;
      case "admin-login-history":
        return (
          <div className="flex min-h-screen bg-ivory">
            <AdminLoginHistory setCurrentPage={setCurrentPage} />
          </div>
        );
      default:
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedProperty={setSelectedProperty}
          />
        );
    }
  };


  // The initial path is resolved in the state initializer above; this only has
  // to follow the browser's back/forward buttons.
  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(pathToPage(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setCurrentPage]);

  // Remember the current page so a hard refresh stays put instead of
  // bouncing back to the homepage (URL-less admin pages have no other way
  // to survive a reload).
  useEffect(() => {
    try {
      localStorage.setItem("currentPage", currentPage);
    } catch (e) {}
  }, [currentPage]);

  // Keep the record a detail page renders, so refreshing on it restores the
  // same property instead of dropping the visitor back on the homepage.
  useEffect(() => {
    try {
      if (selectedProperty)
        localStorage.setItem("selectedProperty", JSON.stringify(selectedProperty));
      else localStorage.removeItem("selectedProperty");
    } catch (e) {}
  }, [selectedProperty]);

  useEffect(() => {
    try {
      if (selectedPropertyId) localStorage.setItem("selectedPropertyId", selectedPropertyId);
      else localStorage.removeItem("selectedPropertyId");
    } catch (e) {}
  }, [selectedPropertyId]);

  // Only the navbar and footer used to touch the address bar, so every other
  // navigation (a card click, a "View All") left a stale URL behind and a
  // refresh landed somewhere else. Keep the path in step with the page.
  useEffect(() => {
    const path = pageToPath(currentPage, selectedProperty);
    if (path && window.location.pathname !== path) {
      try {
        window.history.replaceState({}, "", path);
      } catch (e) {}
    }
  }, [currentPage, selectedProperty]);

  const showNavbar = ![
    "admin-login",
    "admin-dashboard",
    "add-property",
    "edit-property",
    "admin-enquiries",
    "admin-project-enquiries",
    "admin-rental-categories",
    "admin-featured-listing",
    "admin-developers",
    "admin-company-settings",
    "admin-analytics",
    "admin-login-history",
    "project",
    "thank-you",
  ].includes(currentPage);
  const showFooter = ![
    "admin-login",
    "admin-dashboard",
    "add-property",
    "edit-property",
    "admin-enquiries",
    "admin-project-enquiries",
    "admin-rental-categories",
    "admin-featured-listing",
    "admin-developers",
    "admin-company-settings",
    "admin-analytics",
    "admin-login-history",
  ].includes(currentPage);

  const showMobileActionBar = ![
    "admin-login",
    "admin-dashboard",
    "add-property",
    "edit-property",
    "admin-enquiries",
    "admin-project-enquiries",
    "admin-rental-categories",
    "admin-featured-listing",
    "admin-developers",
    "admin-company-settings",
    "admin-analytics",
    "admin-login-history",
    "contact",
    "thank-you",
    "project",
  ].includes(currentPage);

  const isAdminPage = [
    "admin-login",
    "admin-dashboard",
    "add-property",
    "edit-property",
    "admin-enquiries",
    "admin-project-enquiries",
    "admin-rental-categories",
    "admin-featured-listing",
    "admin-developers",
    "admin-company-settings",
    "admin-analytics",
    "admin-login-history",
  ].includes(currentPage);
  return (
    <AuthProvider>
      <UserAuthProvider>
        <PropertyProvider>
          <CategoryProvider>
          <DeveloperProvider>
          <CompanySettingsProvider>
          <FeaturedProjectProvider>
          <EnquiryProvider>
            <div className={`min-h-screen bg-gray-50 ${showMobileActionBar ? "pb-14 sm:pb-0" : ""}`}>
              {showNavbar && (
                <Navbar
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
              {/* Site-wide right-side social icons */}
              {currentPage !== "project" && <SocialBar />}
              <ErrorBoundary>
                {renderPage()}
              </ErrorBoundary>
              {showFooter && (
                <Footer 
                  setCurrentPage={setCurrentPage} 
                  noMargin={currentPage === "contact"} 
                />
              )}

              {/* Only show these widgets if NOT on an admin page */}
              {!isAdminPage && (() => {
                // On property/project detail pages pass the property name so
                // WhatsApp opens with a pre-filled enquiry message.
                const isDetailPage = currentPage === "property-details" ||
                  currentPage === "property-details-classic";
                const activeProjectName = isDetailPage
                  ? selectedProperty?.title || selectedProperty?.name || null
                  : null;
                return (
                  <>
                    <ChatBot />
                    <FloatingWhatsApp projectName={activeProjectName} />
                    {currentPage !== "project" && <TimedWhatsAppPopup />}
                  </>
                );
              })()}
              {showMobileActionBar && (() => {
                const isDetailPage = currentPage === "property-details" ||
                  currentPage === "property-details-classic";
                const activeProjectName = isDetailPage
                  ? selectedProperty?.title || selectedProperty?.name || null
                  : null;
                return (
                  <MobileActionBar
                    setCurrentPage={setCurrentPage}
                    projectName={activeProjectName}
                  />
                );
              })()}
            </div>
          </EnquiryProvider>
          </FeaturedProjectProvider>
          </CompanySettingsProvider>
          </DeveloperProvider>
          </CategoryProvider>
        </PropertyProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;
