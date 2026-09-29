import Link from "next/link"
import React from "react"

function SmartLink({
  href,
  target = "_self",
  linkType = "internal",
  reload = false,
  children,
  onClick,
  className,
  "aria-label": ariaLabel,
  "data-cy": dataCy,
}: {
  href: string
  target?: string
  linkType?: "internal" | "external"
  // Full document navigation instead of a client-side transition (the Publizon
  // reader's module scripts only boot on a fresh document load).
  reload?: boolean
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  className?: string
  // Forwarded to the anchor — arrives via Slot when wrapped in Button asChild.
  "aria-label"?: string
  "data-cy"?: string
}) {
  // Internal link
  if (linkType === "internal") {
    if (reload) {
      return (
        <a
          onClick={onClick}
          className={className}
          href={href}
          target={target}
          aria-label={ariaLabel}
          // eslint-disable-next-line no-restricted-syntax
          data-cy={dataCy}>
          {children}
        </a>
      )
    }
    return (
      <Link
        onClick={onClick}
        className={className}
        href={href}
        target={target}
        prefetch={false}
        aria-label={ariaLabel}
        // eslint-disable-next-line no-restricted-syntax
        data-cy={dataCy}>
        {children}
      </Link>
    )
  }

  // External link
  if (linkType === "external") {
    const validHref = href.startsWith("http") ? href : `https://${href}`
    return (
      <a
        onClick={onClick}
        className={className}
        href={validHref}
        target={target}
        aria-label={ariaLabel}
        // eslint-disable-next-line no-restricted-syntax
        data-cy={dataCy}>
        {children}
      </a>
    )
  }
}

export default SmartLink
