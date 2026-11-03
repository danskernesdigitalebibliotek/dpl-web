import "../src/styles/css/base.css";
import { allModes } from "../.storybook/modes";

// The widths visual regression tests capture every story at.
const visualTestModes = {
  "400px": allModes["xs"],
  "1200px": allModes["xl"],
};

export const parameters = {
  layout: "fullscreen",
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: {
      xs: { name: "XSmall", styles: { width: "400px", height: "900px" } },
      sm: { name: "Small", styles: { width: "640px", height: "900px" } },
      md: { name: "Medium", styles: { width: "768px", height: "900px" } },
      lg: { name: "Large", styles: { width: "1024px", height: "900px" } },
      xl: { name: "XL", styles: { width: "1200px", height: "900px" } },
      "2xl": { name: "2XL", styles: { width: "1536px", height: "900px" } },
    },
  },
  argos: {
    modes: visualTestModes,
    // Default crops to the component at 2x zoom, collapsing fullscreen
    // layouts. Capture the full page.
    fitToContent: false,
  },
};
