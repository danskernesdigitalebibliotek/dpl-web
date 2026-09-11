/**
 * Quotes a value for use in a CQL clause, e.g. `term.creator=${cqlString(name)}`.
 *
 * Backslashes and double quotes inside the value are escaped so that a name
 * like `Frank O'Connor` or a title containing quotes cannot break out of the
 * quoted string and produce a malformed query.
 */
export const cqlString = (value: string): string =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
