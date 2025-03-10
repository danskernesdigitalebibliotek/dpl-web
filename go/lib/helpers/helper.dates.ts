export function generalGoDateFormat(date: Date): string {
  const dateString = date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return dateString
}
