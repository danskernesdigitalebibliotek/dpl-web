import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";

import Icon from "../../shared/icon/Icon";

export default function Footer() {
  return (
    <footer className="bg-background-overlay py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Åbningstider</h2>
            <p className="text-sm mb-4">
              Bibliotekerne lorem ipsum consectetur, adipisci velit, sed quia
              non numquam eius modi tempora incidunt ut labore.
            </p>
            <Link href="#" className="text-sm underline">
              Se bibliotekernes åbningstider
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Om Bibliotekerne</h2>
            <ul className="space-y-2">
              {[
                "Brug af bibliotekerne",
                "Erstatninger og gebyrer",
                "Opret bruger",
                "Biblioteket - A til Å",
                "Internetadgang",
                "Print, scan og kopi",
                "Booking af lokaler",
                "Nyhedsbrev"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Online tilbud</h2>
            <ul className="space-y-2 mb-8">
              {[
                "Litteratursiden",
                "Bibliotek.dk",
                "eReolen",
                "Filmstriben"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold mb-4">Text</h2>
            <ul className="space-y-2">
              {[
                "Lorem ipsum a la lorem ip",
                "Bibliotekerne lorem",
                "Labore ipsum",
                "Adipisci velit le lorem"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-sm mb-4">
              Lyngby-Taarbæk Bibliotekerne
              <br />
              Lyngby Hovedgade 28
              <br />
              2800 Kgs. Lyngby
            </p>
            <p className="text-sm mb-4">
              +45 45 97 37 00
              <br />
              Man - fre / Kl. 10-16
            </p>
            <Link href="mailto:info@ltk.dk" className="text-sm underline">
              info@ltk.dk
            </Link>
          </div>
        </div>

        <div className="mt-8 pb-8 flex justify-between border-b border-border">
          <select className="border rounded px-2 py-1 text-sm">
            <option>DK</option>
          </select>
          <Icon className="h-[40px]" name="library-logo" />
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm">
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
  );
}
