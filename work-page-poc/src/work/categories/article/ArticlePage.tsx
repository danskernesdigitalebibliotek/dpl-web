import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useState } from "react"
import { Link, useSearchParams } from "react-router"

import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { CategoryPageProps } from "../types"
import { getAccessWayKey, getPublicationYear } from "./accessWays"
import { Accordion } from "./Accordion"
import { ArticleCallToAction } from "./ArticleCallToAction"
import {
  getCreators,
  getDetailRows,
  getEditionLine,
  getManifestationTitle,
  getMaterialTypeLabel,
  getYearLabel,
} from "./articleText"
import { DigitalCopyDialog } from "./DigitalCopyDialog"
import { type OptionChoice, OptionPicker } from "./OptionPicker"
import { RetrieverDialog } from "./RetrieverDialog"
import { useArticlePage } from "./useArticlePage"

type OpenDialog = "picker" | "order" | "read-article" | null

const metaLinkClasses = "text-[13px] leading-5 text-text-heading underline underline-offset-4"

/**
 * The article concept from the designer's "Materialesiden – Format først (til
 * DDF)" prototype: material type chips, one button for the chosen edition and
 * way, and a picker for both.
 */
export const ArticlePage = ({ work, manifestation, categoryManifestations }: CategoryPageProps) => {
  const [, setSearchParams] = useSearchParams()
  const { settings } = useConnectionSettings()
  const { data: patron } = usePatron()
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [isPickerFromOrder, setIsPickerFromOrder] = useState(false)
  const [hasClickedWithoutLogin, setHasClickedWithoutLogin] = useState(false)
  const { options, action, periodical } = useArticlePage(manifestation, categoryManifestations, hasClickedWithoutLogin)

  const title = work.titles.main.join(" ")
  const creators = getCreators(manifestation, work)
  const subjects = [...new Set(work.subjects.all.map((subject) => subject.display))]
  const cover = manifestation.cover.detail_500 ?? manifestation.cover.detail_207
  const allEditions = [...work.manifestations.all].sort(
    (first, second) => (getPublicationYear(second) ?? 0) - (getPublicationYear(first) ?? 0)
  )
  const retrieverWay = options.selectedWay?.kind === "read-article" ? options.selectedWay : undefined

  const showManifestation = (choice: OptionChoice) => {
    setHasClickedWithoutLogin(false)
    setSearchParams(choice.wayKey ? { manifestationId: choice.pid, accessWay: choice.wayKey } : { manifestationId: choice.pid })
  }

  const openWay = (kind: "read-article" | "digital-copy") => {
    if (!settings.userToken) {
      setHasClickedWithoutLogin(true)
      return
    }
    setOpenDialog(kind === "read-article" ? "read-article" : "order")
  }

  const openPicker = (isFromOrder: boolean) => {
    setIsPickerFromOrder(isFromOrder)
    setOpenDialog("picker")
  }

  const choose = (choice: OptionChoice) => {
    showManifestation(choice)
    setOpenDialog(isPickerFromOrder && choice.wayKey === "digital-copy" ? "order" : null)
  }

  return (
    <div className="bg-surface-page font-body text-text-heading">
      <main className="mx-auto max-w-[1440px] pb-16">
        <section aria-labelledby="article-title" className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex justify-center px-4 pt-8 lg:order-last lg:items-start lg:px-12 lg:pt-[72px]">
            <div className="relative box-border flex h-[284px] w-[203px] shrink-0 items-center justify-center overflow-hidden rounded p-6 text-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.16)] lg:h-[433px] lg:w-[282px] bg-[#375a8f]">
              {cover ? (
                <img src={cover} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
              ) : (
                <span aria-hidden="true" className="text-[18px] leading-tight font-semibold lg:text-[28px]">
                  {title}
                </span>
              )}
            </div>
          </div>

          <div className="px-4 pt-6 pb-12 lg:px-20 lg:pt-[72px]">
            <h1 id="article-title" className="m-0 font-heading text-[32px] leading-10 font-normal lg:text-[64px] lg:leading-[72px]">
              {title}
            </h1>
            {creators && <p className="m-0 mt-2 text-body-m">Af {creators}</p>}

            <div role="radiogroup" aria-label="Materialetype" className="mt-8 flex flex-wrap gap-2">
              {options.materialTypes.map((materialType) => (
                <label
                  key={materialType.label}
                  className={`box-border inline-flex min-h-11 cursor-pointer items-center rounded-[10px] px-3.5 text-[15px] leading-5 font-medium hover:shadow-[inset_0_0_0_1px_#000] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-black ${
                    materialType.isSelected ? "bg-[#e4ece6] shadow-[inset_0_0_0_1.5px_#375443]" : "bg-white shadow-[inset_0_0_0_1px_#dbdbdb]"
                  }`}
                >
                  <input
                    type="radio"
                    name="article-material-type"
                    checked={materialType.isSelected}
                    onChange={() => showManifestation({ pid: materialType.defaultManifestation.pid, wayKey: undefined })}
                    className="absolute m-0 size-px opacity-0"
                  />
                  {materialType.label}
                </label>
              ))}
            </div>

            <p aria-live="polite" className="m-0 mt-4 text-[15px] leading-6">
              <span className="sr-only">Valgt udgave: </span>
              Udgave: {getYearLabel(manifestation)}
              {options.switchText && (
                <>
                  <span aria-hidden="true" className="mx-1.5 text-text-inactive">
                    ·
                  </span>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => openPicker(false)}
                    className="inline cursor-pointer border-0 bg-transparent p-0 font-body text-[15px] leading-6 font-semibold whitespace-nowrap text-[#3b4a40] underline underline-offset-4"
                  >
                    {options.switchText}
                  </button>
                </>
              )}
            </p>

            <ArticleCallToAction
              action={action.action}
              texts={action.texts}
              onOpen={openWay}
            />
          </div>
        </section>

        <section aria-labelledby="article-description" className="px-4 lg:px-20 lg:pt-12">
          <h2 id="article-description" className="m-0 font-heading text-[28px] leading-[34px] font-normal">
            Beskrivelse
          </h2>
          {work.abstract?.map((paragraph) => (
            <p key={paragraph} className="m-0 mt-5 mb-6 max-w-[760px] text-body-l leading-7">
              {paragraph}
            </p>
          ))}
          {subjects.length > 0 && (
            <p className="m-0 mt-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <b className="text-[13px] leading-5">Emneord</b>
              {subjects.map((subject) => (
                <Link key={subject} to={`/?q=${encodeURIComponent(subject)}`} className={metaLinkClasses}>
                  {subject}
                </Link>
              ))}
            </p>
          )}
          {work.fictionNonfiction && (
            <p className="m-0 mt-3.5 flex flex-wrap items-baseline gap-x-3">
              <b className="text-[13px] leading-5">Skøn-/faglitteratur</b>
              <span className="text-[13px] leading-5">{work.fictionNonfiction.display}</span>
            </p>
          )}
        </section>

        <div className="mx-4 mt-10 lg:mx-20">
          <Accordion title={`Udgaver (${allEditions.length})`}>
            <ul className="m-0 flex list-none flex-col gap-2 px-4 pb-5">
              {allEditions.map((edition) => (
                <li key={edition.pid} className="border border-solid border-outline bg-white px-4 py-3.5">
                  <p className="m-0 text-body-m font-semibold">{getManifestationTitle(edition, work)}</p>
                  <p className="m-0 mt-0.5 text-body-s leading-5 text-text-body">{getEditionLine(edition)}</p>
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Detaljer" subtitle={`${getMaterialTypeLabel(manifestation)} · ${getYearLabel(manifestation)}`}>
            <dl className="m-0 px-4 pb-5">
              {getDetailRows(manifestation, work, periodical.publishedInTo).map((row) => (
                <div key={row.label} className="flex gap-4 border-b border-outline py-[11px]">
                  <dt className="w-[120px] shrink-0 text-body-s text-text-inactive">{row.label}</dt>
                  <dd className="m-0 text-body-s">
                    {row.to ? (
                      <Link to={row.to} className="text-text-heading underline underline-offset-4">
                        {row.value}
                      </Link>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Accordion>
        </div>
      </main>

      {openDialog === "picker" && (
        <OptionPicker
          open
          onClose={() => setOpenDialog(isPickerFromOrder ? "order" : null)}
          onChoose={choose}
          workTitle={title}
          pickerTitle={options.pickerTitle}
          applyLabel={options.applyLabel}
          editions={options.editions}
          selected={{ pid: manifestation.pid, wayKey: options.selectedWay && getAccessWayKey(options.selectedWay) }}
        />
      )}
      {retrieverWay?.kind === "read-article" && (
        <RetrieverDialog
          retrieverId={retrieverWay.retrieverId}
          title={title}
          open={openDialog === "read-article"}
          onClose={() => setOpenDialog(null)}
        />
      )}
      <DigitalCopyDialog
        open={openDialog === "order"}
        onClose={() => setOpenDialog(null)}
        onSwitchEdition={options.switchText ? () => openPicker(true) : undefined}
        title={getManifestationTitle(manifestation, work)}
        materialType={getMaterialTypeLabel(manifestation)}
        creators={creators}
        edition={manifestation.hostPublication?.summary ?? getYearLabel(manifestation)}
        email={patron?.emailAddress}
      />
    </div>
  )
}
