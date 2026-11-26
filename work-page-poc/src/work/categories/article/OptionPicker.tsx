import { type MouseEvent, useState } from "react"

import { Sheet } from "../../../ui/Sheet"
import { type AccessWay, accessWayLabels } from "./accessWays"
import type { EditionWithWays } from "./articleOptions"
import { getAccessWayText, getEditionDetailRows, getMaterialTypeLabel, getYearLabel } from "./articleText"

export type OptionChoice = { pid: string; wayKind: AccessWay["kind"] | undefined }

type OptionPickerProps = {
  open: boolean
  onClose: () => void
  onChoose: (choice: OptionChoice) => void
  workTitle: string
  pickerTitle: string
  applyLabel: string
  editions: EditionWithWays[]
  selected: OptionChoice
}

const footerButtonClasses =
  "box-border h-12 cursor-pointer appearance-none rounded-[10px] border border-solid border-black px-5 font-body text-[14px] font-medium tracking-[0.04em] uppercase"

const radioDotClasses = (isChecked: boolean) =>
  `mt-px box-border size-5 shrink-0 rounded-full border-solid bg-white ${
    isChecked ? "border-[6px] border-black" : "border-[1.5px] border-text-inactive"
  }`

/**
 * The prototype's combined picker: a card per edition of the shown type, with
 * the edition's ways as radios when there is more than one.
 */
export const OptionPicker = ({
  open,
  onClose,
  onChoose,
  workTitle,
  pickerTitle,
  applyLabel,
  editions,
  selected,
}: OptionPickerProps) => {
  const [pending, setPending] = useState(selected)
  const [expandedPids, setExpandedPids] = useState<string[]>([])

  const toggleDetails = (pid: string) =>
    setExpandedPids((pids) => (pids.includes(pid) ? pids.filter((candidate) => candidate !== pid) : [...pids, pid]))

  const pickEdition = (edition: EditionWithWays) => (event: MouseEvent) => {
    const isOnControl = event.target instanceof Element && event.target.closest("label, button")
    if (isOnControl || pending.pid === edition.manifestation.pid) return
    setPending({ pid: edition.manifestation.pid, wayKind: edition.ways[0]?.kind })
  }

  const editionCount = editions.length === 1 ? "1 udgave" : `${editions.length} udgaver`

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={pickerTitle}
      subtitle={`${workTitle} · ${editionCount}`}
      footer={
        <>
          <button type="button" onClick={onClose} className={`${footerButtonClasses} bg-white text-text-heading`}>
            Annullér
          </button>
          <button type="button" onClick={() => onChoose(pending)} className={`${footerButtonClasses} bg-black text-white`}>
            {applyLabel}
          </button>
        </>
      }
    >
      {editions.length > 1 && <p className="m-0 mb-4 text-[15px] leading-[22px] text-text-body">Nyeste udgave først.</p>}
      <div role="radiogroup" aria-label={pickerTitle} className="flex flex-col gap-4">
        {editions.map((edition) => {
          const { manifestation, ways } = edition
          const isPendingEdition = pending.pid === manifestation.pid
          const isExpanded = expandedPids.includes(manifestation.pid)
          const year = getYearLabel(manifestation)
          const title = manifestation.titles.full[0] ?? workTitle
          const host = manifestation.hostPublication?.summary
          const [onlyWay] = ways
          return (
            <section
              key={manifestation.pid}
              onClick={pickEdition(edition)}
              className={`relative cursor-pointer rounded-lg px-5 pt-5 pb-2 transition-colors hover:bg-white ${
                isPendingEdition ? "bg-white shadow-[inset_0_0_0_1px_#000]" : "shadow-[inset_0_0_0_1px_#dbdbdb]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span aria-hidden="true" className="h-16 w-12 shrink-0 rounded-[3px] bg-[#375a8f]" />
                <div className="flex min-w-0 grow flex-col gap-[3px]">
                  <h3 className="m-0 font-heading text-[18px] leading-[23px] font-normal">{title}</h3>
                  {host && <span className="text-body-s leading-5">{host}</span>}
                  <span className="text-[13px] leading-5 text-text-inactive">
                    {getMaterialTypeLabel(manifestation)} · Kilde: {manifestation.source.join(", ")}
                  </span>
                </div>
              </div>

              {ways.length > 1 && (
                <fieldset className="m-0 -mx-3 mt-5 min-w-0 border-0 p-0">
                  <legend className="mb-1 ml-3 p-0 text-[13px] leading-[18px] font-semibold text-text-body">
                    Bestillingsmuligheder
                  </legend>
                  <div className="flex flex-col gap-1">
                    {ways.map((way) => {
                      const isChecked = isPendingEdition && pending.wayKind === way.kind
                      return (
                        <label
                          key={way.kind}
                          className={`box-border flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-black ${
                            isChecked ? "bg-[#f0efea]" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="article-option"
                            checked={isChecked}
                            onChange={() => setPending({ pid: manifestation.pid, wayKind: way.kind })}
                            className="absolute m-0 size-px opacity-0"
                          />
                          <span aria-hidden="true" className={radioDotClasses(isChecked)} />
                          <span className="flex min-w-0 grow flex-col">
                            <span className="text-[15px] leading-[22px] font-semibold">
                              {accessWayLabels[way.kind]}
                              <span className="sr-only">, udgaven fra {year}</span>
                            </span>
                            <span className="text-[13px] leading-[18px] text-[#6b6b6b]">{getAccessWayText(way)}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {ways.length <= 1 && (
                <label className="mt-5 flex cursor-pointer flex-col has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-black">
                  <input
                    type="radio"
                    name="article-option"
                    checked={isPendingEdition}
                    onChange={() => setPending({ pid: manifestation.pid, wayKind: onlyWay?.kind })}
                    aria-label={`${host ?? title}, ${onlyWay ? accessWayLabels[onlyWay.kind] : "kan ikke tilgås her"}`}
                    className="absolute m-0 size-px opacity-0"
                  />
                  <span className="text-[15px] leading-[22px] font-semibold">
                    {onlyWay ? accessWayLabels[onlyWay.kind] : "Kan ikke tilgås her"}
                  </span>
                  <span className="text-[13px] leading-[18px] text-[#6b6b6b]">
                    {onlyWay ? getAccessWayText(onlyWay) : "Kontakt biblioteket for at få fat i den."}
                  </span>
                </label>
              )}

              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleDetails(manifestation.pid)}
                className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-body text-body-s text-text-heading"
              >
                <span className="underline underline-offset-4">Se detaljer</span>
                <span className="sr-only"> om udgaven fra {year}</span>
                <span aria-hidden="true" className={isExpanded ? "rotate-180" : undefined}>
                  ⌄
                </span>
              </button>
              {isExpanded && (
                <dl className="m-0 mb-3 text-[13px] leading-5">
                  {getEditionDetailRows(manifestation).map((row) => (
                    <div key={row.label} className="flex gap-3 py-1">
                      <dt className="w-[90px] shrink-0 text-text-inactive">{row.label}</dt>
                      <dd className="m-0">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )
        })}
      </div>
    </Sheet>
  )
}
