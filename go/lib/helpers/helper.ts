export const filterFalsyValuesFromArray = <T>(
  array: (T | undefined | null | false | 0 | "")[]
): T[] => {
  return array.filter(Boolean) as T[]
}
