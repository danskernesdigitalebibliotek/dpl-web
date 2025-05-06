import Icon from "@/components/shared/icon/Icon"
import SmartLink from "@/components/shared/smartLink/SmartLink"

export default function Footer() {
  return (
    <footer className="bg-background-overlay text-typo-body-md py-12 text-center lg:text-left">
      <div className="content-container">
        <div className="grid-go grid">
          <div className="col-span-full lg:col-span-6">
            <h2 className="text-typo-subtitle-lg col-span-full mb-4">Information</h2>
            <p className="max-w-[600px]">GO er børnenes digitale indgang til folkebiblioteket.</p>
            <ul className="mt-10 grid gap-y-4">
              <li>
                <SmartLink
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go"
                  linkType="external"
                  className="animate-text-underline">
                  Info om GO
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://www.detdigitalefolkebibliotek.dk/ereolen-go-support"
                  linkType="external"
                  className="animate-text-underline">
                  Kontakt og support
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://ereolengo.dk/inspiration/til-skoler"
                  linkType="external"
                  className="animate-text-underline">
                  Skoler og UNI-login
                </SmartLink>
              </li>
              <li>
                <SmartLink
                  href="https://ereolengo.dk/content/bliv-boganbefaler"
                  linkType="external"
                  className="animate-text-underline">
                  Bliv boganbefaler
                </SmartLink>
              </li>
            </ul>
          </div>
          <div className="col-span-full mt-12 flex flex-col items-center justify-end lg:col-span-6">
            <div className="bg-foreground mb-10 ml-0 flex flex-0 items-center rounded-full p-0.5 lg:ml-auto">
              <Icon name="logo-with-outline" className="text-background h-auto w-36 lg:w-40" />
            </div>
            <p className="text-typo-subtitle-lg lg:text-right">
              En del af Bibliotek og Borgerservice Nordfyns Kommune
            </p>
          </div>
        </div>
        <hr className="go-divider mt-10" />
      </div>
    </footer>
  )
}
