export const filterFalsyValuesFromArray = <T>(
  array: (T | undefined | null | false | 0 | "")[]
): T[] => {
  return array.filter(Boolean) as T[]
}

export const contentColorClasses = [
  "bg-accents-pink",
  "bg-accents-purple",
  "bg-accents-orange",
  "bg-accents-blue",
] as const

export const getRandomContentColorClass = () => {
  const randomIndex = Math.floor(Math.random() * contentColorClasses.length)
  return contentColorClasses[randomIndex]
}
