import { ArrowLeft } from "lucide-react";

/**
 * Back link shown at the top of every admin page. Defaults to the dashboard;
 * pages opened from a list (e.g. Edit Property) point back at that list.
 */
const AdminBackButton = ({
  setCurrentPage,
  to = "admin-dashboard",
  label = "Back",
  className = "",
}) => (
  // Block-level wrapper so the button stays left-aligned even inside a
  // centre-aligned page header.
  <div className={`mb-4 flex w-full justify-start ${className}`}>
    <button
      type="button"
      onClick={() => {
        setCurrentPage?.(to);
        try {
          window.scrollTo({ top: 0, behavior: "auto" });
        } catch (e) {
          /* ignore */
        }
      }}
      className="group inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-[13px] font-semibold text-matte transition-colors hover:border-matte hover:bg-matte hover:text-white"
    >
      <ArrowLeft
        size={16}
        className="transition-transform duration-300 group-hover:-translate-x-0.5"
      />
      {label}
    </button>
  </div>
);

export default AdminBackButton;
