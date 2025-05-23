import React from "react"

import { getDplCmsPublicConfig } from "../config/dpl-cms/dplCmsConfig"
import DplCmsConfigContextProvider from "./DplCmsConfigContextProvider"

async function DplCmsConfigContextProviderServer({ children }: { children: React.ReactNode }) {
  const dplCmsConfig = await getDplCmsPublicConfig()

  return <DplCmsConfigContextProvider config={dplCmsConfig}>{children}</DplCmsConfigContextProvider>
}

export default DplCmsConfigContextProviderServer
