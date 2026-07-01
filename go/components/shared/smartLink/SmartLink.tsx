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
}) {
  // Internal link
  if (linkType === "internal") {
    if (reload) {
      return (
        <a onClick={onClick} className={className} href={href} target={target}>
          {children}
        </a>
      )
    }
    return (
      <Link onClick={onClick} className={className} href={href} target={target} prefetch={false}>
        {children}
      </Link>
    )
  }

  // External link
  if (linkType === "external") {
    const validHref = href.startsWith("http") ? href : `https://${href}`
    return (
      <a onClick={onClick} className={className} href={validHref} target={target}>
        {children}
      </a>
    )
  }
}

export default SmartLink
