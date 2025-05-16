import { operationNames } from "./graphql";

export type Operations = keyof typeof operationNames.Query;