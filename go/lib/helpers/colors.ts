// This file naming doesn't adhere to the "helper.xyz.ts" naming convention because Tailwind
// otherwise doesn't recognize the file as a CSS file and doesn't apply the classes.

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
