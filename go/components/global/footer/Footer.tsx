import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"

import Icon from "../../shared/icon/Icon"

export default function Footer() {
  return (
    <footer className="bg-background-overlay text-typo-body-md py-12 text-center lg:text-left">
      <div className="content-container">
        <div className="flex flex-col flex-nowrap lg:flex-row lg:justify-between">
          <div className="col-span-full">
            <h2 className="text-typo-subtitle-lg col-span-full mb-4">Information</h2>
            <p className="max-w-[600px]">
              Bibliotekerne lorem ipsum consectetur, adipisci velit, sed quia non numquam eius modi
              tempora incidunt ut labore.
            </p>
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
        <hr className="go-divider mt-5" />

        <div className="mt-8 flex w-full flex-col items-center justify-between md:flex-row">
          <div className="mb-4 flex items-center space-x-4 md:mb-0">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 md:justify-end">
            <Link href="#" className="animate-text-underline">
              Behandling af persondata
            </Link>
            <Link href="#" className="animate-text-underline">
              Tilgængelighed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
