import Link from "next/link"
import React from "react"

function SmartLink({
  href,
  target = "_self",
  linkType = "internal",
  children,
  className,
}: {
  href: string
  target?: string
  linkType?: "internal" | "external"
  children: React.ReactNode
  className?: string
}) {
  // Internal link
  if (linkType === "internal") {
    return (
      <Link className={className} href={href} target={target}>
        {children}
      </Link>
    )
  }

  // External link
  if (linkType === "external") {
    return (
      <a className={className} href={href} target={target}>
        {children}
      </a>
    )
  }
}

export default SmartLink
