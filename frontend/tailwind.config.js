/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        figma: {
          canvas: "#1e1e1e",
          canvasLight: "#f0f0f0",
          panel: "#2c2c2c",
          panelLight: "#ffffff",
          panelHeader: "#242424",
          border: "#383838",
          borderLight: "#e5e5e5",
          borderHover: "#4f4f4f",
          blue: "#0d99ff",
          blueHover: "#007be5",
          purple: "#9747ff",
          green: "#00b574",
          red: "#f24822",
          orange: "#ff7262",
          yellow: "#ffc700",
          text: "#ffffff",
          textSecondary: "#b3b3b3",
          textMuted: "#757575",
          inputBg: "#1e1e1e",
          inputBorder: "#383838",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        figma: "6px",
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      },
      animation: {
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
