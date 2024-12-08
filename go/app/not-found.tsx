import Link from "next/link"

import { Button } from "@/components/shared/button/Button"

export default function NotFound() {
  return (
    <div
      className="content-container flex-column lg:space-y-grid-gap-1 my-grid-gap-2 h-[] w-full space-y-grid-gap-2
        lg:my-grid-gap-half">
      <h2 className="text-typo-huge">Oopsie..</h2>
      <p className="text-typo-body-lg">Vi kan desværre ikke loade siden.</p>
      <Button ariaLabel="Tilbage til sitet" asChild size={"lg"}>
        <Link href="/" className="text-typo-body-lg">
          Tilbage til GO! sitet
        </Link>
      </Button>
    </div>
  )
}
