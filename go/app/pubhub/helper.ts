export const transformTimeToUtcString = (timeString: string) => {
  return timeString.split(" ").join("T")
}
