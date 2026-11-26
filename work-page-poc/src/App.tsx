import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useMemo } from "react"
import { Route, Routes } from "react-router"

import { ConnectionPanel } from "./connection/ConnectionPanel"
import { createServiceLayerConfig } from "./connection/serviceLayerConfig"
import { useConnectionSettings } from "./connection/useConnectionSettings"
import { SiteHeader } from "./header/SiteHeader"
import { SearchPage } from "./pages/SearchPage"
import { WorkPage } from "./work/WorkPage"

/** The PoC shell: the header with its article search, the two pages and the connection panel. */
export const App = () => {
  const { settings } = useConnectionSettings()
  const serviceLayerConfig = useMemo(() => createServiceLayerConfig(settings), [settings])

  return (
    <ServiceLayerProvider config={serviceLayerConfig}>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/work/:workId" element={<WorkPage />} />
      </Routes>
      <ConnectionPanel />
    </ServiceLayerProvider>
  )
}
