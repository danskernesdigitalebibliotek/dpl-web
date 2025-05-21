import { md5 } from "js-md5"

import { getDplCmsPrivateConfig } from "../config/dpl-cms/dplCmsConfig"
import { getServerEnv } from "../config/env"

export const getPublizonServiceParameters = async () => {
  const {
    unilogin: { pubHubRetailerKeyCode },
  } = await getDplCmsPrivateConfig()
  return {
    clientid: getServerEnv("UNLILOGIN_PUBHUB_CLIENT_ID") ?? "",
    retailerid: getServerEnv("UNLILOGIN_PUBHUB_RETAILER_ID") ?? "",
    // The  Publizon services expect the retailerkeycode to be an MD5 hash
    // of the actual key code.
    retailerkeycode: md5(pubHubRetailerKeyCode ?? ""),
  }
}
