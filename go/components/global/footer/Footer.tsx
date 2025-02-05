import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"

import Icon from "../../shared/icon/Icon"

export default function Footer() {
  return (
    <footer className="bg-background-overlay py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Åbningstider</h2>
            <p className="mb-4">
              Bibliotekerne lorem ipsum consectetur, adipisci velit, sed quia non numquam eius modi
              tempora incidunt ut labore.
            </p>
            <Link href="#" className="underline">
              Se bibliotekernes åbningstider
            </Link>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Om Bibliotekerne</h2>
            <ul className="space-y-2">
              {[
                "Brug af bibliotekerne",
                "Erstatninger og gebyrer",
                "Opret bruger",
                "Biblioteket - A til Å",
                "Internetadgang",
                "Print, scan og kopi",
                "Booking af lokaler",
                "Nyhedsbrev",
              ].map(item => (
                <li key={item}>
                  <Link href="#" className="hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Online tilbud</h2>
            <ul className="mb-8 space-y-2">
              {["Litteratursiden", "Bibliotek.dk", "eReolen", "Filmstriben"].map(item => (
                <li key={item}>
                  <Link href="#" className="hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mb-4 text-xl font-semibold">Text</h2>
            <ul className="space-y-2">
              {[
                "Lorem ipsum a la lorem ip",
                "Bibliotekerne lorem",
                "Labore ipsum",
                "Adipisci velit le lorem",
              ].map(item => (
                <li key={item}>
                  <Link href="#" className="hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Kontakt</h2>
            <p className="mb-4">
              Lyngby-Taarbæk Bibliotekerne
              <br />
              Lyngby Hovedgade 28
              <br />
              2800 Kgs. Lyngby
            </p>
            <p className="mb-4">
              +45 45 97 37 00
              <br />
              Man - fre / Kl. 10-16
            </p>
            <Link href="mailto:info@ltk.dk" className="underline">
              info@ltk.dk
            </Link>
          </div>
        </div>

        <div className="border-border mt-8 flex justify-between border-b pb-8">
          <select className="rounded border px-2 py-1">
            <option>DK</option>
          </select>
          <Icon className="h-[40px]" name="library-logo" />
        </div>

        <div className="mt-8 flex flex-col items-center justify-between md:flex-row">
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
            <Link href="#" className="hover:underline">
              Behandling af persondata
            </Link>
            <Link href="#" className="hover:underline">
              Servicedeklaration
            </Link>
            <Link href="#" className="hover:underline">
              Relement
            </Link>
            <Link href="#" className="hover:underline">
              Tilgængelighed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
