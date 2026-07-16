import { KeenSliderOptions } from "keen-slider/react"

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
