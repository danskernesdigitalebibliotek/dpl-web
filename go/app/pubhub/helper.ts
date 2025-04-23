export const transformTimeToUtcString = (timeString: string) => {
  return timeString.split(" ").join("T")
}

export const regexDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}[\.0-9A-Z]*$/
export const regexNumber = /^\d+$/
