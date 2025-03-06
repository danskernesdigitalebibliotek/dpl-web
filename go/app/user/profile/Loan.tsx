import React from "react"

type LoanProps = { isbn: string }

const Loan = ({ isbn }: LoanProps) => {
  return <div>{isbn}</div>
}

export default Loan
