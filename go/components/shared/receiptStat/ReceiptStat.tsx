import React from "react"

type ReceiptStatProps = {
  term: string
  value: string
  dataCy?: string
}

const ReceiptStat = ({ term, value, dataCy }: ReceiptStatProps) => (
  // eslint-disable-next-line no-restricted-syntax -- dataCy comes from cyKeys at call site
  <div className="bg-background-skeleton/40 rounded-base px-6 py-5 text-center" data-cy={dataCy}>
    <dt className="text-typo-caption text-foreground-muted first-letter:uppercase">{term}</dt>
    <dd className="text-typo-heading-5 mt-2">{value}</dd>
  </div>
)

export default ReceiptStat
