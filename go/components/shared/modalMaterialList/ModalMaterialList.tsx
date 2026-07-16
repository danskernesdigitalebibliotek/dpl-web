import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type ModalMaterialListProps = {
  // Optional section heading, e.g. "Klar til afhentning (2)".
  heading?: string
  dataCy?: string
  className?: string
  children: React.ReactNode
}

// A modal's material list (loans, reservations): an optional section heading
// and a divided list of ModalMaterialListItem rows.
const ModalMaterialList = ({ heading, dataCy, className, children }: ModalMaterialListProps) => (
  <section className={cn("mx-auto w-full max-w-prose space-y-6", className)}>
    {heading && <h3 className="text-typo-subtitle-md">{heading}</h3>}
    {/* eslint-disable-next-line no-restricted-syntax -- dataCy comes from cyKeys at call site */}
    <ul data-cy={dataCy} className="divide-foreground/10 divide-y">
      {children}
    </ul>
  </section>
)

export default ModalMaterialList
