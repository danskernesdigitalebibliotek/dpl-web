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
