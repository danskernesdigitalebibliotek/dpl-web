import { md5 } from "js-md5"

export const getPublizonServiceParameters = () => {
  return {
    clientid: process.env.UNLILOGIN_PUBHUB_CLIENT_ID ?? "",
    retailerid: process.env.UNLILOGIN_PUBHUB_RETAILER_ID ?? "",
    retailerkeycode: md5(process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE ?? ""),
  }
}
