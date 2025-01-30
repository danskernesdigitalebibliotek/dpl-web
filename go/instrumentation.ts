import { QueryClient } from "@tanstack/react-query"

import { ensureDplCmsConfig } from "./lib/config/dpl-cms/dplCmsConfig"
import getQueryClient from "./lib/getQueryClient"

export async function register() {
  const queryClient = getQueryClient()
  // By doing this, we ensure that the DPL CMS configuration is loaded
  // before any other queries are executed.
  // The next time we will call it server side it is cached.
  ensureDplCmsConfig(queryClient)
}
