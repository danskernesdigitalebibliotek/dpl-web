import { Metadata } from "next"
import Link from "next/link"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoCer")

const pocs = [
  { href: "/book-quiz/1-facetsoegning", label: "PoC 1 – Facetsøgning", ready: true },
  { href: "/book-quiz/2-tilladt-liste", label: "PoC 2 – Tilladt-liste", ready: true },
  { href: "/book-quiz/3-korrelation", label: "PoC 3 – Korrelation", ready: true },
  { href: "/book-quiz/4-emoji", label: "PoC 4 – Emoji", ready: true },
  { href: "/book-quiz/5-score", label: "PoC 5 – Score", ready: true },
  { href: "/book-quiz/6-flow", label: "PoC 6 – Rigtigt flow", ready: true },
  { href: "/book-quiz/7-score-model", label: "PoC 7 – Score-model (A/B)", ready: true },
  { href: "/book-quiz/8-grupper", label: "PoC 8 – Genre- & emnegrupper", ready: true },
]

const Page = () => {
  return (
    <section className="mx-auto my-8 w-full max-w-5xl px-4">
      <h1 className="text-2xl font-bold">Boganbefaler-quiz — PoCer</h1>
      <ul className="mt-4 flex flex-col gap-1">
        {pocs.map(poc => (
          <li key={poc.href}>
            {poc.ready ? (
              <Link className="underline" href={poc.href}>
                {poc.label}
              </Link>
            ) : (
              <span className="opacity-40">{poc.label} (endnu ikke bygget)</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link className="underline" href="/book-quiz/fremtid">
          Fremtidig optimering (parkerede emner)
        </Link>
      </p>
    </section>
  )
}

export default Page
