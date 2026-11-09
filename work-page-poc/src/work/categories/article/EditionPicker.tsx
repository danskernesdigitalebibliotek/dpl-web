import { useState } from "react"

import type { Manifestation } from "../../../fbi/types"
import { ActionButton } from "../../../ui/ActionButton"
import { Sheet } from "../../../ui/Sheet"
import { getDetailRows, getEditionTitle, getHostDetail } from "./articleText"

type EditionPickerProps = {
  open: boolean
  onClose: () => void
  onChoose: (manifestation: Manifestation) => void
  title: string
  typeLabel: string
  editions: Manifestation[]
  shown: Manifestation
  recommended: Manifestation
}

const getEditionMeta = (manifestation: Manifestation) =>
  [manifestation.hostPublication?.title, getHostDetail(manifestation), manifestation.source.join(", ")]
    .filter(Boolean)
    .join(" · ")

/** "Vælg udgave": the article's editions as radio cards. */
export const EditionPicker = ({
  open,
  onClose,
  onChoose,
  title,
  typeLabel,
  editions,
  shown,
  recommended,
}: EditionPickerProps) => {
  const [pendingPid, setPendingPid] = useState(shown.pid)
  const [expandedPids, setExpandedPids] = useState<string[]>([])

  const toggleDetails = (pid: string) =>
    setExpandedPids((pids) => (pids.includes(pid) ? pids.filter((candidate) => candidate !== pid) : [...pids, pid]))

  const choose = () => {
    const chosen = editions.find((edition) => edition.pid === pendingPid)
    if (chosen) onChoose(chosen)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Vælg udgave"
      subtitle={`${title} · ${typeLabel} · ${editions.length} udgaver`}
      footer={
        <>
          <div className="w-40">
            <ActionButton variant="secondary" onClick={onClose}>
              Annullér
            </ActionButton>
          </div>
          <div className="w-40">
            <ActionButton variant="primary" onClick={choose}>
              Vælg udgave
            </ActionButton>
          </div>
        </>
      }
    >
      <p className="mx-1 mt-0 mb-5 text-body-m text-text-body">
        Artiklen findes i {editions.length} udgaver. De giver adgang på forskellige måder.
      </p>
      <ul role="radiogroup" aria-label="Udgaver" className="m-0 flex list-none flex-col gap-3 p-0">
        {editions.map((edition) => {
          const isPending = edition.pid === pendingPid
          const isExpanded = expandedPids.includes(edition.pid)
          const editionTitle = getEditionTitle(edition)
          return (
            <li key={edition.pid}>
              <article
                className={`relative box-border rounded-lg transition hover:bg-surface-card ${
                  isPending
                    ? "-translate-y-0.5 border-2 border-solid border-outline-strong bg-surface-card px-[13px] pt-[15px] pb-px shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
                    : "border border-solid border-outline px-3.5 pt-4 pb-0.5"
                } has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-black`}
              >
                <label className="flex cursor-pointer items-start gap-3.5">
                  <input
                    type="radio"
                    name="article-edition"
                    checked={isPending}
                    onChange={() => setPendingPid(edition.pid)}
                    className="absolute top-0 left-0 m-0 size-px opacity-0"
                  />
                  <span aria-hidden="true" className="h-[73px] w-[52px] shrink-0 rounded-[3px] bg-brand-120" />
                  <span className="flex min-w-0 flex-auto flex-col gap-[3px]">
                    {edition.pid === recommended.pid && (
                      <span className="mb-[5px] inline-flex h-[22px] items-center self-start rounded bg-brand-20 px-2 text-caption font-medium whitespace-nowrap text-brand-120">
                        Hurtigste adgang
                      </span>
                    )}
                    <span className="font-heading text-[19px] leading-6 text-text-heading">{editionTitle}</span>
                    <span className="text-[13px] leading-5 text-text-inactive">{getEditionMeta(edition)}</span>
                  </span>
                </label>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleDetails(edition.pid)}
                  className="mt-0.5 inline-flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-body text-body-s leading-5 text-text-heading"
                >
                  <span className="underline underline-offset-4">Se detaljer</span>
                  <span className="sr-only"> om udgaven {editionTitle}</span>
                  <span aria-hidden="true" className={isExpanded ? "rotate-180" : undefined}>
                    ⌄
                  </span>
                </button>
                {isExpanded && (
                  <dl
                    aria-label={`Detaljer om udgaven ${editionTitle}`}
                    className="m-0 mb-3 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1 rounded-lg border border-solid border-outline bg-surface-card px-3.5 py-3 text-[13px] leading-5"
                  >
                    {getDetailRows(edition).map((row) => (
                      <div key={row.label} className="contents">
                        <dt className="text-text-inactive">{row.label}</dt>
                        <dd className="m-0">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
