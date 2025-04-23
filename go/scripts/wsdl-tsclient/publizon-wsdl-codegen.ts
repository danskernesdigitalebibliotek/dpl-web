import { generateWsdlFiles } from "./helper"

const wsdlFiles = [
  "./lib/soap/publizon/v2_7/wsdl/createloan.wsdl",
  "./lib/soap/publizon/v2_7/wsdl/getlibraryinfo.wsdl",
  "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl",
  "./lib/soap/publizon/v2_7/wsdl/getproductloanstatus.wsdl",
]
generateWsdlFiles(wsdlFiles)
