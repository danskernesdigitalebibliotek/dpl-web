import prependFile from "prepend-file"
import { parseAndGenerate } from "wsdl-tsclient"

const wsdlFiles = [
  "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl",
  "./lib/soap/publizon/v2_7/wsdl/getproductloanstatus.wsdl",
]

wsdlFiles.forEach(wsdlFile => {
  const pattern = /(.*)\/wsdl\/([^\/]+)\.wsdl$/
  const operationId = wsdlFile.replace(pattern, "$2")
  const directory = wsdlFile.replace(pattern, "$1")

  parseAndGenerate(`${directory}/wsdl/${operationId}.wsdl`, `${directory}/generated/`).then(() => {
    prependFile(
      `${directory}/generated/${operationId}/index.ts`,
      "// This is generated code thus no need for type checking...\r\n// @ts-nocheck\r\n"
    ).then(() => {
      console.log(`Generated files for ${operationId}`)
    })
  })
})
