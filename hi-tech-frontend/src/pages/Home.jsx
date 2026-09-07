import { useContext, useEffect, useMemo, useState } from "react";
import { PropertyContext } from "../context/PropertyContext";
import { CategoryContext } from "../context/CategoryContext";
import { FeaturedProjectContext } from "../context/FeaturedProjectContext";
import api from "../utils/api";

import Hero from "../components/home/Hero";
import PropertySearch from "../components/home/PropertySearch";
import TrustFeatures from "../components/home/TrustFeatures";
import FeaturedProjects from "../components/home/FeaturedProjects";
import FeaturedShowcase from "../components/luxury/FeaturedShowcase";
import FeaturedListings from "../components/luxury/FeaturedListings";
import DeveloperPortfolio from "../components/luxury/DeveloperPortfolio";
import LuxWhyChooseUs from "../components/luxury/WhyChooseUs";
import LuxTestimonials from "../components/luxury/LuxTestimonials";
import JoinTeam from "../components/luxury/JoinTeam";
import LuxContact from "../components/luxury/LuxContact";
import AboutSection from "../components/home/AboutSection";
import CollectionStrip from "../components/home/CollectionStrip";

// Client testimonials as published on the site today.
const TESTIMONIALS = [
  {
    name: "Mr. Bhuvneshwar Yadav",
    role: "Long-term Investor",
    quote:
      "They focus genuinely on my investment goals instead of just closing a deal. It felt like having a real partner on the investment side.",
  },
  {
    name: "Mr. Manoj Juneja",
    role: "Regional Manager, Adidas",
    quote:
      "The team is quick, transparent and very responsive. Every query was handled with patience, and the entire experience stayed completely hassle-free.",
  },
  {
    name: "CA Surender Sharma",
    role: "Home Buyer",
    quote:
      "From shortlisting projects to negotiation and paperwork, they stayed involved at every step. I happily recommend them to family and friends.",
  },
  {
    name: "Mr. Ramesh Thakur",
    role: "Business Owner",
    quote:
      "Professional, approachable and proactive. I always felt updated on site visits, pricing and offers, which built a lot of trust.",
  },
  {
    name: "Dr. Anjali Malhotra",
    role: "Medical Professional",
    quote:
      "As a doctor with a busy schedule, I appreciated their curated approach. They only showed me properties that matched my exact criteria, saving me immense time.",
  },
  {
    name: "Mr. Vikram Sethi",
    role: "Software Architect",
    quote:
      "Their technical understanding of project layouts and construction quality is impressive. They helped me find a home that was both functional and aesthetically superior.",
  },
  {
    name: "Mrs. Kavita Rao",
    role: "Entrepreneur",
    quote:
      "Transparent dealings and honest advice. They didn't just highlight the pros but also pointed out potential concerns, which helped me make a balanced decision.",
  },
  {
    name: "Mr. Sanjay Khanna",
    role: "Senior Vice President",
    quote:
      "The level of professionalism at Brothers Realestate is top-notch. They handled the entire documentation and legal process seamlessly, making it a stress-free experience.",
  },
  {
    name: "Ms. Priya Sharma",
    role: "IT Consultant",
    quote:
      "I was looking for my first home and was quite lost. Their team guided me like family, explaining everything from home loans to possession timelines clearly.",
  },
  {
    name: "Mr. Rajesh Gupta",
    role: "Retired Army Officer",
    quote:
      "Discipline and integrity are what I value most, and I found both in my dealings with them. Their commitment to their word is truly commendable.",
  },
];

const Home = ({ setCurrentPage, setSelectedProperty, setSelectedCollectionKey }) => {
  const { properties, loading, fetchProperties } = useContext(PropertyContext);
  const {
    categories: rentalCategoriesList = [],
    loading: rentalCategoriesLoading,
  } = useContext(CategoryContext);
  const {
    featuredProjects,
    loading: featuredLoading,
    findFeatured,
  } = useContext(FeaturedProjectContext);

  const [curatedCollections, setCuratedCollections] = useState([]);
  const [curatedLoading, setCuratedLoading] = useState(true);
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    fetchProperties();

    // Curated collections — prefer manual `curatedProperty` titles so anything
    // tagged "Curated Property" in the admin shows up here.
    const fetchCuratedCollections = async () => {
      try {
        const titlesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/properties/curated/titles`
        );
        const titlesJson = await titlesRes.json();
        if (
          titlesJson.success &&
          Array.isArray(titlesJson.data) &&
          titlesJson.data.length > 0
        ) {
          setCuratedCollections(
            titlesJson.data.map((t) => {
              const titleVal = (t.title || "").toString();
              return {
                title: titleVal,
                count:
                  typeof t.count === "number"
                    ? `${t.count} Properties`
                    : t.count || "0 Properties",
                image: t.image,
                key: t._id || t.key || titleVal.toLowerCase().replace(/\s+/g, "-"),
              };
            })
          );
          return;
        }

        // Fallback: legacy collection keys
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/properties/collections/curated`
        );
        const result = await response.json();
        if (result.success) setCuratedCollections(result.data || []);
      } catch (error) {
        console.error("Failed to fetch curated collections:", error);
        setCuratedCollections([]);
      } finally {
        setCuratedLoading(false);
      }
    };

    const fetchFeaturedLocations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/properties/locations/featured`
        );
        const result = await response.json();
        if (result.success) {
          const manual = result.data?.manual || [];
          const cities = result.data?.cities || [];

          setFeaturedLocations([
            ...manual.map((m) => ({
              name: m.title,
              tagline: m.title,
              image: m.image,
              count: m.count || 0,
            })),
            ...cities.map((c) => ({
              name: c.name,
              tagline: c.tagline,
              image: c.image,
              count: c.count || 0,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch featured locations:", error);
        setFeaturedLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchCuratedCollections();
    fetchFeaturedLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Premium Projects — newest sale listings, shown as detail cards.
  const premiumProjects = useMemo(
    () =>
      [...(properties || [])]
        .filter((p) => !p.rentalCategory)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [properties]
  );

  // The editorial showcase (Premium Property) takes the newest/featured properties from the backend
  const showcaseProjects = useMemo(() => {
    const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const all = [...(properties || [])];
    const featured = all.filter((p) => p.featured).sort(byNewest);
    const rest = all.filter((p) => !p.featured).sort(byNewest);
    return [...featured, ...rest].slice(0, 4);
  }, [properties]);

  // ---- navigation helpers (localStorage handshake read by the listing pages) ----

  const goTo = (page) => {
    setCurrentPage(page);
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  const setHandshake = (payload) => {
    try {
      localStorage.setItem("listingsFilter", JSON.stringify(payload));
    } catch (e) {
      /* ignore */
    }
  };

  // A Featured Listing project always opens its own brochure, wherever the card
  // was clicked; everything else uses the standard detail page.
  const handleSelectProperty = (property) => {
    // Analytics: property click (best-effort, never blocks navigation)
    try {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId =
          Date.now().toString() + Math.random().toString(36).substring(2);
        localStorage.setItem("sessionId", sessionId);
      }
      api.post("/analytics/click", {
        propertyId: property._id,
        sessionId,
      }).catch(err => console.error("Analytics click tracking error:", err));
    } catch (error) {
      console.error("Analytics setup error:", error);
    }

    const featured = findFeatured(property);
    setSelectedProperty(featured || property);
    goTo(featured ? "property-details" : "property-details-classic");
  };

  const handleCuratedClick = (title, collectionKey) => {
    const keyMap = {
      "New Projects": "new-projects",
      "Ready to Move": "ready-to-move",
      "Luxury Homes": "luxury",
      "Budget Friendly": "budget-friendly",
    };
    const key =
      collectionKey || keyMap[title] || title.toLowerCase().replace(/\s+/g, "-");
    try {
      if (typeof setSelectedCollectionKey === "function")
        setSelectedCollectionKey(key);
    } catch (e) {
      /* ignore */
    }
    // Send both: Listings matches a manual curated title OR a collections key.
    setHandshake({ type: "curated", title, key });
    goTo("listings");
  };

  const handleRentalCategoryClick = (category) => {
    setHandshake({ type: "rentalCategory", id: category._id });
    goTo("rental-listings");
  };

  const handleLocationClick = (loc) => {
    setHandshake({ type: "featured", title: loc.name });
    goTo("listings");
  };

  // ---- section item mapping ----

  // A collection with nothing in it would open an empty listings page, so only
  // the ones that actually hold properties are shown.
  const hasProperties = (count) => Number(String(count ?? "").match(/\d+/)?.[0] || 0) > 0;

  const curatedItems = curatedCollections
    .filter((c) => hasProperties(c.count))
    .map((c) => ({
      key: c.key || c.title,
      title: c.title,
      meta: c.count,
      image: c.image,
      onClick: () => handleCuratedClick(c.title, c.key),
    }));

  const rentalItems = rentalCategoriesList
    .filter((c) => c.propertyCount > 0)
    .map((c) => ({
      key: c._id,
      title: c.name,
      meta: `${c.propertyCount} ${c.propertyCount === 1 ? "Property" : "Properties"}`,
      image: c.image,
      onClick: () => handleRentalCategoryClick(c),
    }));

  const locationItems = featuredLocations
    .filter((loc) => Number(loc.count) > 0)
    .map((loc, i) => ({
      key: `${loc.name}-${i}`,
      title: loc.name,
      meta: `${loc.count} ${Number(loc.count) === 1 ? "Property" : "Properties"}`,
      image: loc.image,
      onClick: () => handleLocationClick(loc),
    }));

  return (
    <div className="bg-white text-ink">
      <Hero setCurrentPage={setCurrentPage} />
      <PropertySearch setCurrentPage={setCurrentPage} />
      <TrustFeatures />

      {/* Premium Projects — individual property cards straight from the API */}
      <FeaturedProjects
        properties={premiumProjects}
        loading={loading}
        onSelect={handleSelectProperty}
        setCurrentPage={setCurrentPage}
      />

      {/* FeaturedShowcase removed as per user request */}

      {/* Curated Collections — commented out as per user request.
      <CollectionStrip
        eyebrow="Curated For You"
        title="Curated Collections"
        subtitle="Browse handpicked groups of properties, organised the way buyers actually search."
        items={curatedItems}
        loading={curatedLoading}
        emptyText="No collections available at the moment."
        onViewAll={() => goTo("listings")}
      />
      */}

      {/* Featured Listings — 3x2 grid with the trust strip.
          Keeps the bespoke Featured Listing brochure, unlike every other section. */}
      <FeaturedListings
        properties={featuredProjects}
        loading={featuredLoading}
        onOpen={handleSelectProperty}
        setCurrentPage={setCurrentPage}
      />

      {/* Rental replaced by Land — commented out, not removed.
      <CollectionStrip
        eyebrow="Rentals"
        title="Rental Properties"
        subtitle="Ready-to-move rental homes, grouped by configuration."
        items={rentalItems}
        loading={rentalCategoriesLoading}
        emptyText="No rental categories available right now."
        onViewAll={() => goTo("rental-listings")}
      />
      */}

      {/* Featured Locations — commented out as per user request.
      <CollectionStrip
        eyebrow="Locations"
        title="Featured Locations"
        subtitle="Find your home in the right corridor across Gurgaon and Delhi NCR."
        items={locationItems}
        loading={locationsLoading}
        emptyText="No featured locations available."
        onViewAll={() => goTo("listings")}
      />
      */}

      <DeveloperPortfolio setCurrentPage={setCurrentPage} />

      <AboutSection setCurrentPage={setCurrentPage} />

      <LuxWhyChooseUs />

      {/* Testimonials — commented out as per user request.
      <LuxTestimonials testimonials={TESTIMONIALS} />
      */}

      {/* Join Team — commented out as per user request.
      <JoinTeam setCurrentPage={setCurrentPage} />
      */}

      <LuxContact setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default Home;
