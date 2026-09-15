import sdkStyles from "@wedobooks/sdk/main.css"

const STYLE_ELEMENT_ID = "wedobooks-sdk-styles"

/**
 * Put the SDK's own stylesheet on the page.
 *
 * `@wedobooks/sdk` publishes main.css but never imports it, so without this the
 * reader runs with its highlight animation missing. Injected once and keyed on
 * an id, since several readers or players can mount over a page's lifetime.
 */
export function ensureWedoBooksStyles(document: Document): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) return

  const style = document.createElement("style")
  style.id = STYLE_ELEMENT_ID
  style.textContent = sdkStyles
  document.head.appendChild(style)
}
