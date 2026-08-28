/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A1730",
          900: "#0F1E3D",
          800: "#152A52",
        },
        brand: {
          700: "#154DA8",
          600: "#1B5FCC",
          500: "#2E74E6",
          100: "#E6EFFC",
        },
        teal: {
          500: "#18C2DF",
          100: "#E3FAFD",
        },
        ink: {
          900: "#0F1826",
          700: "#33404F",
          500: "#64748B",
          400: "#8D9AAE",
        },
        paper: "#F4F7FC",
        line: "#E1E7F0",
        success: "#12946F",
        warning: "#B7791F",
        danger: "#D64545",
      },
      fontFamily: {
        head: ["var(--font-manrope)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "24px",
        md: "15px",
        sm: "10px",
      },
      boxShadow: {
        card: "0 4px 16px -8px rgba(15,30,61,0.12)",
        button: "0 8px 18px -8px rgba(27,95,204,0.45)",
      },
    },
  },
  plugins: [],
};
