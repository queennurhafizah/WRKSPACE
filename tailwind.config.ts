import type { Config } from "tailwindcss";

/**
 * Design system WRKSPACE — "Retro Pop"
 * Base terang (ivory) dengan aksen dusty pink, sky blue, sage, butter, grape.
 *
 * Font system (3 font):
 *   - display  → Bricolage Grotesque (Primary)  — heading h1–h4
 *   - sans     → Outfit               (Secondary) — body, UI, form
 *   - accent   → Caveat               (Accent)    — tagline, highlight dekoratif
 *
 * Warna per tipe space:
 *   - Personal Desk  → brand (dusty pink)
 *   - Meeting Room   → sky (blue)
 *   - Private Office → sage (green)
 *   - Promo/diskon   → butter
 *   - Status tunggu  → grape
 *   - Dibatalkan     → rose
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        ivory: "#FAFAF7",
        paper: "#FFFFFF",

        brand: {
          soft: "#FDE8EF",
          border: "#F5B8CB",
          DEFAULT: "#E87EA1",
          text: "#C0527A",
          deep: "#881337",
        },
        sky: {
          soft: "#DDEEFF",
          border: "#AED6F1",
          DEFAULT: "#85C1E9",
          text: "#1A6FA3",
          deep: "#075985",
        },
        sage: {
          soft: "#E8F8E8",
          border: "#A8D8A8",
          DEFAULT: "#7FC47F",
          text: "#2D7A2D",
          deep: "#1E5C1E",
        },
        butter: {
          soft: "#FEF9E7",
          border: "#F7DC6F",
          DEFAULT: "#EFC94C",
          text: "#9A7D0A",
          deep: "#6B5600",
        },
        grape: {
          soft: "#F3EEFF",
          border: "#D8BEFC",
          DEFAULT: "#C084FC",
          text: "#6D28D9",
          deep: "#4C1D95",
        },
        rose: {
          soft: "#FDECEC",
          border: "#F3B4B4",
          DEFAULT: "#E57373",
          text: "#B03A3A",
          deep: "#7F1D1D",
        },
      },

      fontFamily: {
        // Primary: semua heading h1–h4
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        // Secondary: body text, UI, form, navbar
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        // Accent: tagline, highlight label, dekoratif
        accent: ["var(--font-caveat)", "cursive"],
      },

      borderRadius: {
        pill: "999px",
      },

      boxShadow: {
        soft: "0 4px 24px rgba(26,26,26,0.07)",
        card: "0 6px 32px rgba(26,26,26,0.08)",
        "brand-glow": "0 6px 20px rgba(232,126,161,0.35)",
        "sky-glow": "0 6px 20px rgba(133,193,233,0.35)",
      },

      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(20px, -18px) scale(1.06)" },
        },
      },

      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "blob-drift": "blob-drift 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
