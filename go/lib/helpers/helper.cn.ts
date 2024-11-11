import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

import { extendedTheme } from "@/tailwind.config"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: Object.keys(extendedTheme.fontSize),
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
