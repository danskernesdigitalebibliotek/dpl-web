export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}

export const allModes = {
  sm: { name: "Small", styles: { width: breakpoints["sm"], height: "900px" } },
  md: {
    name: "Medium",
    styles: { width: breakpoints["md"], height: "900px" },
  },
  lg: { name: "Large", styles: { width: breakpoints["lg"], height: "900px" } },
  xl: {
    name: "Extra large",
    styles: { width: breakpoints["xl"], height: "900px" },
  },
  "2xl": {
    name: "2 Extra large",
    styles: { width: breakpoints["2xl"], height: "900px" },
  },
}
