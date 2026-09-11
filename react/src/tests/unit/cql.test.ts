import { describe, expect, it } from "vitest";
import { cqlString } from "../../core/utils/helpers/cql";

describe("cqlString", () => {
  it("wraps the value in double quotes", () => {
    expect(cqlString("Astrid Lindgren")).toBe('"Astrid Lindgren"');
  });

  it("leaves apostrophes alone since they cannot end a double-quoted string", () => {
    expect(cqlString("Frank O'Connor")).toBe(`"Frank O'Connor"`);
  });

  it("escapes double quotes inside the value", () => {
    expect(cqlString('The "Real" Story')).toBe('"The \\"Real\\" Story"');
  });

  it("escapes backslashes before quotes so an escaped quote stays escaped", () => {
    expect(cqlString('back\\slash"')).toBe('"back\\\\slash\\""');
  });
});
