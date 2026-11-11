// Google Fonts' CSS for the preview's next/font/google calls, pointing at the
// same font files served by the Storybook. Storybook otherwise keeps Google's
// URLs, so every story would load its font from fonts.gstatic.com.
// The files are DM Sans v17's variable fonts, which cover every weight.
const unicodeRanges = {
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
}

// Relative, as the CSS ends up in a <style> element of the preview's iframe.
const dmSans = Object.entries(unicodeRanges)
  .map(
    ([subset, unicodeRange]) => `@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url(storybook-fonts/dm-sans-${subset}.woff2) format('woff2');
  unicode-range: ${unicodeRange};
}`
  )
  .join("\n")

module.exports = {
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap": dmSans,
}
