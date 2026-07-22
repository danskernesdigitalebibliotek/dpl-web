import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [(value: string) => Boolean(value) && value.includes("typo")],
        },
      ],
      // Custom radius tokens (theme.css) so conflicting rounded-* classes merge.
      rounded: [{ rounded: ["base"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
