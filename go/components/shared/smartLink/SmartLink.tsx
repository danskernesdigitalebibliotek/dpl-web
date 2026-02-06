import Link from "next/link"
import React from "react"

function SmartLink({
  href,
  target = "_self",
  linkType = "internal",
  children,
  onClick,
  className,
}: {
  href: string
  target?: string
  linkType?: "internal" | "external"
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  className?: string
}) {
  // Internal link
  if (linkType === "internal") {
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
