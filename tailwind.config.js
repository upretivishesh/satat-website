/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Matches the existing sustainabilitysolutions.in theme variables
        "primary-green": "#2e6b3d",
        "secondary-green": "#4a8c4a",
        "accent-green": "#78b159",
        "bg-neutral": "#f8f5ee",
        "surface": "#fff",
        "dark-text": "#222",
        "gray-text": "#666",
        "border-neutral": "#e8e8e8",
        "cta-hover": "#23552f",
        "cream": "#fdfbf7",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        naturn: "0 10px 30px rgba(0,0,0,0.04)",
        "naturn-hover": "0 15px 35px rgba(46,107,61,0.1)",
      },
    },
  },
  plugins: [],
};
