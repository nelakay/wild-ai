import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: { DEFAULT: "#6B21A8", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#DB2777", foreground: "#FFFFFF" },
        success: { DEFAULT: "#059669", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#D97706", foreground: "#FFFFFF" },
        danger: { DEFAULT: "#E11D48", foreground: "#FFFFFF" },
      },
    },
    dark: {
      colors: {
        primary: { DEFAULT: "#9333EA", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#EC4899", foreground: "#FFFFFF" },
        success: { DEFAULT: "#059669", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#D97706", foreground: "#FFFFFF" },
        danger: { DEFAULT: "#E11D48", foreground: "#FFFFFF" },
      },
    },
  },
});
