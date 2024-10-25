import { extendedTheme } from "@/tailwind.config"
import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

function formatColors() {
	const colors = []
	for (const [key, color] of Object.entries(extendedTheme.extend.colors)) {
		if (typeof color === 'string') {
			colors.push(key)
		} else {
			const colorGroup = Object.keys(color).map(subKey =>
				subKey === 'DEFAULT' ? '' : subKey,
			)
			colors.push({ [key]: colorGroup })
		}
	}
	return colors
}

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: formatColors(),
    },
    classGroups: {
      'font-size': [
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
