import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Cursor-inspired minimal dark palette
        background: "#0b0f14",
        foreground: "#e6eaf0",
        muted: {
          DEFAULT: "#11161d",
          foreground: "#9aa3b2"
        },
        primary: {
          DEFAULT: "#6ae3ff", // accent cyan
          foreground: "#081018"
        },
        secondary: {
          DEFAULT: "#8b93a7",
          foreground: "#0b0f14"
        },
        border: "#1a232e",
        ring: "#6ae3ff"
      },
      fontSize: {
        sm: ["0.9rem", "1.4rem"],
        base: ["1.05rem", "1.7rem"],
        lg: ["1.2rem", "1.85rem"],
        xl: ["1.35rem", "2rem"]
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px"
      }
    }
  }
} satisfies Config;