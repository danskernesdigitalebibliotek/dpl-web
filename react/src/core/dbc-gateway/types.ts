import { operationNames } from "./generated/graphql";

type QueryOperations = keyof typeof operationNames.Query;
type MutationOperations = keyof typeof operationNames.Mutation;

// The service layer sends its own FBI queries on an app's behalf. They are
// absent from this project's codegen because the documents live there, but a
// test still has to be able to intercept them.
type ServiceLayerOperations = "catalogueDetailsByIsbn";

export type Operations =
  QueryOperations | MutationOperations | ServiceLayerOperations;
