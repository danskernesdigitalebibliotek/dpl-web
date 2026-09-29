export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Type guard that checks whether an array has at least one element.
 *
 * @template T The type of the array's elements.
 * @param candidates The array to inspect.
 * @returns True if the array is not empty, otherwise false.
 *
 * @example
 * if (isNonEmpty(seeds)) {
 *   const [firstSeed, ...fallbackSeeds] = seeds;
 * }
 */
export const isNonEmpty = <T>(
  candidates: readonly T[]
): candidates is NonEmptyArray<T> => candidates.length > 0;
