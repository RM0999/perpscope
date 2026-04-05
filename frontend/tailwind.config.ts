import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080b12",
          card: "#0d1117",
          hover: "#111827",
        },
        border: {
          DEFAULT: "#1b2332",
        },
        accent: {
          green: "#00e396",
          red: "#ff4560",
          yellow: "#feb019",
          blue: "#008ffb",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#484f58",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
