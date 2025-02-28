const kebabToPascal = word =>
  word
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

const transformer = type => inputSchema => ({
  ...inputSchema,
  paths: Object.entries(inputSchema.paths).reduce(
    (acc, [path, pathItem]) => ({
      ...acc,
      [path]: Object.entries(pathItem).reduce(
        (pathItemAcc, [verb, operation]) => ({
          ...pathItemAcc,
          [verb]: {
            ...operation,
            ...(operation?.operationId
              ? { operationId: `${operation?.operationId}${kebabToPascal(type)}` }
              : {}),
          },
        }),
        {}
      ),
    }),
    {}
  ),
})

export default transformer
