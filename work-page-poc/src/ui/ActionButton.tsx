import type { ReactNode } from "react"
import { Link } from "react-router"

export type ActionButtonVariant = "primary" | "secondary" | "disabled"

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: "border-ink bg-ink text-white cursor-pointer",
  secondary: "border-outline-strong bg-surface-card text-text-heading cursor-pointer",
  disabled: "border-outline bg-surface-card text-text-inactive cursor-not-allowed",
}

const baseClasses =
  "box-border flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-solid px-6 font-body text-button font-medium uppercase whitespace-nowrap no-underline appearance-none"

type ActionButtonProps = {
  variant: ActionButtonVariant
  children: ReactNode
} & (
  | { onClick: () => void; href?: never; to?: never }
  | { href: string; onClick?: never; to?: never }
  | { to: string; onClick?: never; href?: never }
)

/** The artifacts' full-width call-to-action, as a button, an external link or an app link. */
export const ActionButton = ({ variant, children, onClick, href, to }: ActionButtonProps) => {
  const className = `${baseClasses} ${variantClasses[variant]}`

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
        <span aria-hidden="true">↗</span>
        <span className="sr-only"> (åbner i et nyt vindue)</span>
      </a>
    )
  }
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={variant === "disabled"} className={className}>
      {children}
    </button>
  )
}
