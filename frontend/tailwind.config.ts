import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        steel: "#264653",
        ember: "#d97706",
        sand: "#f6ead8",
        mist: "#f5f7fb",
        danger: "#c2410c"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(16, 33, 43, 0.12)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(217,119,6,0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(38,70,83,0.18), transparent 26%), linear-gradient(135deg, #f5f7fb 0%, #fff7ed 100%)"
      }
    }
  },
  plugins: []
};

export default config;

