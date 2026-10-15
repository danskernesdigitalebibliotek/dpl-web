/**
 * Dependabot matches `dependency-name` with its own small matcher, not a glob
 * library: `*` becomes `.*`, every other character is literal, and both sides
 * are lower-cased (common/lib/dependabot/config/update_config.rb). So `*`
 * crosses `/`, and `?`, `[abc]` and `{a,b}` mean themselves.
 *
 * Dependabot also runs an ecosystem-specific name normaliser over both sides
 * first; lower-casing is the part of it that matters for npm and Composer.
 */
export function wildcardMatch(pattern: string, name: string): boolean {
  const body = pattern
    .toLowerCase()
    .split("*")
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*")
  return new RegExp(`^${body}$`).test(name.toLowerCase())
}

/** Whether a `dependency-name` is a pattern rather than one exact package. */
export function isWildcard(pattern: string): boolean {
  return pattern.includes("*")
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe("wildcardMatch", () => {
    it.each([
      // `*` is not a path glob: it crosses `/`, which a glob library would not.
      ["*", "@storybook/react", true],
      ["*", "drupal/core", true],
      ["*storybook*", "@storybook/react", true],
      // Matching is case-insensitive, as Dependabot lower-cases both sides.
      ["Cypress", "cypress", true],
      // Only `*` is special; the rest is literal.
      ["foo[1]", "foo[1]", true],
      ["foo[1]", "foo1", false],
      ["foo?", "foo?", true],
      ["foo?", "fooa", false],
      ["@storybook/*", "@storybook/addon-designs", true],
      ["@storybook/*", "storybook", false],
      ["drupal/core*", "drupal/core", true],
      ["drupal/core*", "drupal/facets", false],
    ])("matches %s against %s", (pattern, name, expected) => {
      expect(wildcardMatch(pattern, name)).toBe(expected)
    })
  })
}
