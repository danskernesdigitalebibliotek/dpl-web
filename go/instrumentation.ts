import { getDplCmsUniloginConfig } from "./lib/config/dpl-cms/dplCmsConfig"

export async function register() {
  // By doing this, we ensure that the DPL CMS configuration is loaded
  // before any other queries are executed.
  // The next time we will call it server side it is cached.
  getDplCmsUniloginConfig()
}
