import { CyHttpMessages } from "node_modules/cypress/types/net-stubbing"

import { Operations as DplCmsOperations } from "@/lib/graphql/generated/dpl-cms/types"
import { Operations as FbiOperations } from "@/lib/graphql/generated/fbi/types"

export type Operations = FbiOperations | DplCmsOperations

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (
  req: CyHttpMessages.IncomingHttpRequest,
  operationName: Operations
) => {
  const pattern = /(query|mutation) (\w+)[(]*/g
  const matches = pattern.exec(req.body.query)
  return matches && operationName === matches[2]
}
