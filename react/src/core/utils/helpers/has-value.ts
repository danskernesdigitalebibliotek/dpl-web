/**
 * Type guard that checks whether a value is neither null nor undefined.
 *
 * @template T The type of the value being checked.
 * @param candidate The value to inspect.
 * @returns True if the value is not null or undefined, otherwise false.
 *
 * @example
 * const value: string | null | undefined = getValue();
 * if (hasValue(value)) {
 *   value.toUpperCase();
 * }
 */
export const hasValue = <T>(candidate: T | null | undefined): candidate is T =>
  candidate !== null && candidate !== undefined;
