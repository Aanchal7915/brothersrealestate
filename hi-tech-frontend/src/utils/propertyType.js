// Property Type is a real backend field (`propertyType`) on both the Property
// and FeaturedProject models, set from the admin forms. The same three options
// are used by every admin form and every search bar.

export const PROPERTY_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  // Rental commented out, not removed — Land replaces it as the third
  // public category. The rental pages/admin panel still work if visited
  // directly; they're just no longer linked from the nav or this dropdown.
  // { value: "rent", label: "Rental" },
];

/** Human label for a stored value, e.g. "commercial" → "Commercial". */
export const propertyTypeLabel = (value) =>
  PROPERTY_TYPE_OPTIONS.find((o) => o.value === value)?.label || "";

/**
 * The type a record effectively belongs to. Records added before this field
 * existed default to "residential", so anything under a rental category is
 * treated as Rent — otherwise old rentals would show under Residential too.
 */
export const effectivePropertyType = (property) => {
  const stored = property?.propertyType;
  if (stored && stored !== "residential") return stored;
  if (property?.rentalCategory) return "rent";
  return stored || "residential";
};

/** True when the record matches the selected type, or when none is selected. */
export const matchesPropertyType = (property, type) =>
  !type || effectivePropertyType(property) === type;
