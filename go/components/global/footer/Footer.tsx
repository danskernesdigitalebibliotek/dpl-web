import Icon from "@/components/shared/icon/Icon"
import SmartLink from "@/components/shared/smartLink/SmartLink"

import LinkToParentLibrary from "../header/LinkToParentLibrary"

export default function Footer() {
  return (
    <footer className="bg-background-overlay text-typo-body-md py-12 text-center lg:text-left">
      <div className="content-container">
        <div className="grid-go grid">
          <div className="col-span-full lg:col-span-6">
            <h2 className="text-typo-subtitle-lg col-span-full mb-4">Information</h2>
            <p className="text-typo-body-md max-w-[600px]">
              GO er børnenes digitale indgang til folkebiblioteket.
            </p>
            <ul className="mt-10 space-y-5">
              <li>
                <SmartLink
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go"
                  linkType="external"
                  className="animate-text-underline text-typo-body-md">
                  Info om GO
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go-support"
                  linkType="external"
                  className="animate-text-underline text-typo-body-md">
                  Kontakt og support
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://www.detdigitalefolkebibliotek.dk/om-uni-login"
                  linkType="external"
                  className="animate-text-underline text-typo-body-md">
                  Skoler og UNI-login
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://selvbetjening.aarhuskommune.dk/da/content/upload-af-anbefaling-til-ereolen-go-0"
                  linkType="external"
                  className="animate-text-underline text-typo-body-md">
                  Bliv boganbefaler
                </SmartLink>
              </li>
            </ul>
          </div>
          <div className="col-span-full mt-12 flex flex-col items-center justify-end lg:col-span-6">
            <div
              className="bg-foreground mb-10 ml-0 flex flex-0 items-center rounded-full p-0.5
                lg:ml-auto">
              <Icon name="logo-with-outline" className="text-background h-auto w-36 lg:w-40" />
            </div>
            <LinkToParentLibrary className="text-typo-subtitle-lg lg:w-full lg:text-right" />
          </div>
        </div>
        <hr className="mt-10" />
      </div>
    </footer>
  )
}
