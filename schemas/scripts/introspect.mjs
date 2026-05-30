#!/usr/bin/env node
// Introspect a GraphQL endpoint and write the schema as SDL.
//
//   node introspect.mjs <url> <output-path> [bearer-token]
//
// Token also reads from $GRAPHQL_BEARER_TOKEN.

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

// Resolve `graphql` from cwd, not this script's location — schemas/ has
// no node_modules of its own.
const require = createRequire(`${process.cwd()}/_`);
const { buildClientSchema, getIntrospectionQuery, printSchema } = require("graphql");

const [, , url, outputPath, tokenArg] = process.argv;

if (!url || !outputPath) {
  console.error("usage: node introspect.mjs <url> <output-path> [bearer-token]");
  process.exit(2);
}

const token = tokenArg ?? process.env.GRAPHQL_BEARER_TOKEN;

const headers = { "Content-Type": "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

const res = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({ query: getIntrospectionQuery() }),
});

if (!res.ok) {
  console.error(`introspection request failed: ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

const body = await res.json();
if (body.errors) {
  console.error("introspection returned GraphQL errors:");
  console.error(JSON.stringify(body.errors, null, 2));
  process.exit(1);
}
if (!body.data) {
  console.error("introspection response had no data");
  process.exit(1);
}

const schema = buildClientSchema(body.data);
writeFileSync(outputPath, printSchema(schema) + "\n");
console.log(`wrote ${outputPath}`);
