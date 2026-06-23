// Sort an SDL file so introspection-order differences don't cause
// codegen drift in CI. Reads the file, parses it, prints it back with
// lexicographically-sorted types/fields/args.
//
// `drush sailor:introspect` doesn't emit fields in a deterministic
// order — schema-build order varies with Drupal module load and cache
// state, so two clean introspections can produce semantically
// identical SDL with different field ordering. Running this after the
// introspect step makes the output stable.
const fs = require("fs");
const { buildSchema, lexicographicSortSchema, printSchema } = require("graphql");

const path = process.argv[2];
if (!path) {
  console.error("usage: normalizeGraphqlSchema.js <path-to-schema.graphql>");
  process.exit(1);
}

const src = fs.readFileSync(path, "utf8");
const sorted = printSchema(lexicographicSortSchema(buildSchema(src, { assumeValidSDL: true })));
fs.writeFileSync(path, sorted + "\n");
