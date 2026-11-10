import { DebugPanel } from "../debug/DebugPanel"
import { explainCategory } from "./categories/registry"
import type { CategoryPageProps, ManifestationCategory } from "./categories/types"
import type { TraceSection } from "./trace"

type CategoryDebugPanelProps = {
  category: ManifestationCategory
  pageProps: CategoryPageProps
  selectionTrace: TraceSection
}

/**
 * Calls the category's trace hook. Keyed by category where it's rendered, so
 * a change of category remounts it rather than changing the hooks it calls.
 */
export const CategoryDebugPanel = ({ category, pageProps, selectionTrace }: CategoryDebugPanelProps) => {
  const pageTrace = category.usePageTrace(pageProps)
  return (
    <DebugPanel
      categoryName={category.name}
      sections={[explainCategory(pageProps.manifestation), selectionTrace, ...pageTrace]}
      rules={category.rules}
      rawData={pageProps.manifestation}
    />
  )
}
