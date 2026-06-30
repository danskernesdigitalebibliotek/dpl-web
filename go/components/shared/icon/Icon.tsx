type IconProps = {
  name: string
  className?: string
  ariaLabel?: string
}

export default function Icon({ name, className, ariaLabel }: IconProps) {
  if (!name) return null
  let SVG
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SVG = require(`../../../public/icons/${name}.svg`)?.default
  } catch (error) {
    console.error(`Icon ${name} not found: ${error}`)
  }

  if (!SVG) return null
  return <SVG className={className} aria-hidden={!ariaLabel} aria-label={ariaLabel || ""} />
}
