import { Metadata } from "next"
import Link from "next/link"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – PoCer")

const pocs = [
  { href: "/book-quiz/1-facetsoegning", label: "PoC 1 – Facetsøgning", ready: true },
  { href: "/book-quiz/2-tilladt-liste", label: "PoC 2 – Tilladt-liste", ready: false },
  { href: "/book-quiz/3-korrelation", label: "PoC 3 – Korrelation", ready: false },
  { href: "/book-quiz/4-emoji", label: "PoC 4 – Emoji", ready: false },
  { href: "/book-quiz/5-score", label: "PoC 5 – Score", ready: false },
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
    </section>
  )
}

export default Page
