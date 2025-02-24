import { cn } from "@/lib/helpers/helper.cn"

type IconProps = {
  name: string
  className?: string
}

export default function Icon({ name, className }: IconProps) {
  try {
    if (!name) return null
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SVG = require(`../../../public/icons/${name}.svg`)?.default
    if (!SVG) return null
    return <SVG className={cn("h-full w-full", className)} />
  } catch (error) {
    console.error(`Icon ${name} not found: ${error}`)
  }
}
