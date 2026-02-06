import { parseAndGenerate } from "@reloaddk/wsdl-tsclient"

export const generateWsdlFiles = (wsdlFiles: string[]) => {
  wsdlFiles.forEach(wsdlFile => {
    const pattern = /(.*)\/wsdl\/([^\/]+)\.wsdl$/
    const operationId = wsdlFile.replace(pattern, "$2")
    const directory = wsdlFile.replace(pattern, "$1")
    parseAndGenerate(`${directory}/wsdl/${operationId}.wsdl`, `${directory}/generated/`)
  })
}
