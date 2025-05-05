import Link from "next/link"

import Icon from "@/components/shared/icon/Icon"

export default function Footer() {
  return (
    <footer className="bg-background-overlay text-typo-body-md py-12 text-center lg:text-left">
      <div className="content-container">
        <div className="flex flex-col flex-nowrap lg:flex-row lg:justify-between">
          <div className="col-span-full">
            <h2 className="text-typo-subtitle-lg col-span-full mb-4">Information</h2>
            <p className="max-w-[600px]">GO er børnenes digitale indgang til folkebiblioteket.</p>
            <ul className="mt-10 grid gap-y-4">
              <li>
                <Link
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go"
                  className="animate-text-underline">
                  Info om GO
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go-support"
                  className="animate-text-underline">
                  Kontakt og support
                </Link>
              </li>
              <li>
                <Link
                  href="https://ereolengo.dk/inspiration/til-skoler"
                  className="animate-text-underline">
                  Skoler og UNI-login
                </Link>
              </li>
              <li>
                <Link
                  href="https://ereolengo.dk/content/bliv-boganbefaler"
                  className="animate-text-underline">
                  Bliv boganbefaler
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-10 flex flex-col items-center justify-end">
            <div className="bg-foreground mb-10 ml-0 flex flex-0 items-center rounded-full lg:ml-auto">
              <Icon name="logo-with-outline" className="text-background h-auto w-52" />
            </div>
            <p className="text-typo-subtitle-lg ml-auto">
              En del af Bibliotek og Borgerservice Nordfyns Kommune
            </p>
          </div>
        </div>
        <hr className="go-divider mt-10" />
      </div>
    </footer>
  )
}
