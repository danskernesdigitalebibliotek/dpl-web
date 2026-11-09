import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useMemo } from "react"
import { Link, Route, Routes } from "react-router"

import { ConnectionPanel } from "./connection/ConnectionPanel"
import { createServiceLayerConfig } from "./connection/serviceLayerConfig"
import { useConnectionSettings } from "./connection/useConnectionSettings"
import { SearchPage } from "./pages/SearchPage"
import { WorkPage } from "./work/WorkPage"

/** The PoC shell: connection panel, a way back to search, and the two pages. */
export const App = () => {
  const { settings } = useConnectionSettings()
  const serviceLayerConfig = useMemo(() => createServiceLayerConfig(settings), [settings])

  return (
    <ServiceLayerProvider config={serviceLayerConfig}>
      <header>
        <Link to="/">Search</Link>
      </header>
      <hr />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/work/:workId" element={<WorkPage />} />
      </Routes>
      <ConnectionPanel />
    </ServiceLayerProvider>
  )
}
