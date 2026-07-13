import { differenceInCalendarDays, parseISO } from "date-fns"
import { KeenSliderOptions } from "keen-slider/react"

// FBS delivers dueDate as a date-only string ("2026-07-16") meaning "the
// material must be returned during this calendar day". parseISO parses
// date-only strings as LOCAL midnight (unlike new Date(), which yields UTC
// midnight), so the calendar-day difference never passes through a timezone
// conversion — a loan due tomorrow is "1 day away" all of today.
export const daysUntilDue = (dueDate: string): number =>
  differenceInCalendarDays(parseISO(dueDate), new Date())

export const loanSliderOptions: KeenSliderOptions = {
  initial: 0,
  slides: {
    origin: "auto",
    spacing: 1,
    perView: 1.3,
  },
  breakpoints: {
    "(min-width: 768px)": {
      slides: {
        origin: "auto",
        spacing: 1,
        perView: () => {
          return 2.5
        },
      },
    },
    "(min-width: 1024px)": {
      slides: {
        spacing: 2,
        perView: () => {
          return 3.7
        },
      },
    },
  },
}
