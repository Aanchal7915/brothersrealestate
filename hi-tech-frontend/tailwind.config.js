/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brothers Realestate brand palette
        navy: {
          DEFAULT: "#071B49",
          50: "#F6F8FC",
          100: "#E8EDF7",
          600: "#123B8C",
          700: "#0D2C6B",
          900: "#071B49",
        },
        royal: "#123B8C",
        accent: {
          DEFAULT: "#E83E83",
          soft: "#FCEAF3",
          600: "#D42D71",
        },
        ink: "#101828",
        muted: "#667085",
        surface: "#F6F8FC",

        // ---- Luxury theme: warm white / matte black / champagne gold ----
        ivory: {
          DEFAULT: "#FAF8F4",
          50: "#FDFCFA",
          100: "#F2EEE6",
        },
        matte: {
          DEFAULT: "#0C0C0D",
          800: "#151517",
          700: "#1F1F22",
          600: "#2A2A2E",
        },
        gold: {
          DEFAULT: "#C1A265",
          light: "#DCC894",
          pale: "#EFE6D2",
          dark: "#9A7F49",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        // High-contrast serif for luxury editorial headings
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(7,27,73,0.14)",
        "card-hover": "0 12px 32px -8px rgba(7,27,73,0.20)",
        float: "0 20px 60px -18px rgba(7,27,73,0.28)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.22,.61,.36,1) forwards",
      },
    },
  },
  plugins: [],
};
