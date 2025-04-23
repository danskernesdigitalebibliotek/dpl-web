type IconProps = {
  name: string
  className?: string
  ariaLabel?: string
}

export default function Icon({ name, className, ariaLabel }: IconProps) {
  try {
    if (!name) return null
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SVG = require(`../../../public/icons/${name}.svg`)?.default
    if (!SVG) return null
    return (
      <SVG
        className={className}
        aria-hidden={ariaLabel ? false : true}
        aria-label={ariaLabel || ""}
      />
    )
  } catch (error) {
    console.error(`Icon ${name} not found: ${error}`)
  }
}
