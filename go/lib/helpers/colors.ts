export const contentColorClasses = [
  "bg-content-pink",
  "bg-content-purple",
  "bg-content-orange",
  "bg-content-blue",
] as const

export const getRandomContentColorClass = () => {
  const randomIndex = Math.floor(Math.random() * contentColorClasses.length)
  return contentColorClasses[randomIndex]
}
