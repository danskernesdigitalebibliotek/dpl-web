import { useState } from "react"
import { Link, useSearchParams } from "react-router"

import type { CategoryPageProps } from "../types"
import { pickFastestAccess } from "./accessWays"
import { AccessActions } from "./AccessActions"
import { getArticleTypeLabel, getDetailRows, getEditionValue, getHostDetail } from "./articleText"
import { DetailList } from "./DetailList"
import { EditionPicker } from "./EditionPicker"

const TypeLabel = ({ label, className }: { label: string; className: string }) => (
  <span
    className={`box-border h-9 items-center self-start rounded-lg border border-solid border-outline bg-surface-card px-3.5 text-[15px] leading-5 font-medium ${className}`}
  >
    {label}
  </span>
)

/**
 * The article concept from the designer's "Materialeside – Udgavevælger"
 * artifact: its mobile article boards below 1024px, and its "Flere formater ·
 * Udgavevælger · Desktop" board (current layout) from there up.
 */
export const ArticlePage = ({ work, manifestation, categoryManifestations }: CategoryPageProps) => {
  const [, setSearchParams] = useSearchParams()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)

  const title = work.titles.main.join(" ")
  const creators = (manifestation.creators.length ? manifestation.creators : work.creators).map(
    (creator) => creator.display
  )
  const typeLabel = getArticleTypeLabel(manifestation)
  const host = manifestation.hostPublication
  const hostDetail = getHostDetail(manifestation)
  const subjects = [...new Set(work.subjects.all.map((subject) => subject.display))]
  const hasOtherEditions = categoryManifestations.length > 1
  const recommended = pickFastestAccess(categoryManifestations)
  const isRecommended = recommended.pid === manifestation.pid
  const cover = manifestation.cover.detail_500 ?? manifestation.cover.detail_207

  return (
    <div className="bg-surface-page font-body text-text-heading">
      <main className="mx-auto max-w-[1440px]">
        <section
          aria-labelledby="article-title"
          className="grid grid-cols-1 gap-6 px-4 pt-8 pb-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-16 lg:pt-14 lg:pr-[clamp(48px,15vw,216px)] lg:pl-[clamp(48px,8.5vw,122px)]"
        >
          <div className="flex flex-col items-center gap-6 lg:order-last lg:items-end">
            <div className="relative box-border flex aspect-[5/7] w-[203px] max-w-full items-end overflow-hidden rounded-[3px] bg-brand-120 p-[18px] shadow-[0_2px_24px_rgba(0,0,0,0.08)] lg:w-[360px]">
              {cover ? (
                <img src={cover} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
              ) : (
                <span aria-hidden="true" className="font-heading text-xl leading-[26px] text-white">
                  {title}
                </span>
              )}
            </div>
            <TypeLabel label={typeLabel} className="inline-flex self-center lg:hidden" />
          </div>

          <div className="min-w-0">
            <div className="flex w-[440px] max-w-full flex-col">
              <h1 id="article-title" className="m-0 mt-4 font-heading text-[32px]/10 font-normal lg:mt-0 lg:text-h1">
                {title}
              </h1>
              {creators.length > 0 && (
                <p className="m-0 mt-3 text-body-m text-text-body lg:mt-5 lg:text-[20px] lg:leading-[30px] lg:text-text-heading">
                  Af {creators.join(", ")}
                </p>
              )}
              {host && (
                <p className="m-0 mt-1 text-body-m text-text-body lg:text-[20px] lg:leading-[30px] lg:text-text-heading">
                  I:{" "}
                  <Link
                    to={`/?q=${encodeURIComponent(host.title)}`}
                    className="text-text-heading underline underline-offset-[3px]"
                  >
                    {host.title}
                  </Link>
                  {hostDetail && `, ${hostDetail}`}
                </p>
              )}
              <TypeLabel label={typeLabel} className="mt-6 hidden lg:inline-flex" />

              <div className={hasOtherEditions ? "mt-7" : "mt-8 lg:mt-7"}>
                {hasOtherEditions && (
                  <div className="mb-3 flex min-h-11 items-center gap-4">
                    <span id="article-edition" className="min-w-0 grow text-body-m">
                      <span className="text-text-body">Udgave:</span>{" "}
                      <span className="font-semibold">
                        {isRecommended && "Hurtigste adgang · "}
                        {getEditionValue(manifestation)}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-describedby="article-edition"
                      onClick={() => setIsPickerOpen(true)}
                      className="min-h-11 shrink-0 cursor-pointer border-0 bg-transparent px-1 font-body text-body-m text-text-heading underline underline-offset-[3px]"
                    >
                      Skift<span className="sr-only"> udgave</span>
                    </button>
                  </div>
                )}
                <AccessActions
                  key={manifestation.pid}
                  manifestation={manifestation}
                  title={title}
                  isRecommended={isRecommended}
                  hasOtherEditions={hasOtherEditions}
                />
              </div>
            </div>
          </div>
        </section>

        {(!!work.abstract?.length || subjects.length > 0) && (
          <section aria-labelledby="article-description" className="mx-4 lg:mx-[129px] lg:pt-16">
            <h2 id="article-description" className="m-0 font-heading text-[28px] leading-8 font-normal lg:text-h2">
              Beskrivelse
            </h2>
            {work.abstract?.map((paragraph) => (
              <p
                key={paragraph}
                className="m-0 mt-5 max-w-[800px] text-body-l leading-7 text-text-body lg:mt-8 lg:text-[20px] lg:leading-8"
              >
                {paragraph}
              </p>
            ))}
            {subjects.length > 0 && (
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-body-s leading-5 text-text-inactive">Emneord</span>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <Link
                      key={subject}
                      to={`/?q=${encodeURIComponent(subject)}`}
                      className="box-border inline-flex h-9 items-center border border-solid border-outline-strong bg-surface-card px-[15px] text-body-s leading-5 text-text-heading no-underline"
                    >
                      {subject}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mx-4 mt-12 mb-16 border border-solid border-outline bg-surface-card lg:mx-[129px] lg:mt-20">
          <h3 className="m-0">
            <button
              type="button"
              aria-expanded={isDetailsOpen}
              onClick={() => setIsDetailsOpen((isOpen) => !isOpen)}
              className={`box-border flex h-[72px] w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 text-left font-body text-body-l font-normal text-text-heading lg:h-[88px] lg:pr-8 lg:pl-6 lg:text-[22px] ${
                isDetailsOpen ? "shadow-[inset_0_-1px_0_var(--color-outline)]" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="box-border size-9 shrink-0 rounded-full border border-solid border-text-body bg-[#e8e8e4] lg:size-10"
              />
              <span className="grow">Detaljer om materialet</span>
              <span aria-hidden="true" className={isDetailsOpen ? "rotate-180" : undefined}>
                ⌄
              </span>
            </button>
          </h3>
          {isDetailsOpen && <DetailList rows={getDetailRows(manifestation)} />}
        </section>
      </main>

      {isPickerOpen && (
        <EditionPicker
          open
          onClose={() => setIsPickerOpen(false)}
          onChoose={(chosen) => {
            setIsPickerOpen(false)
            setSearchParams({ manifestationId: chosen.pid })
          }}
          title={title}
          typeLabel={typeLabel}
          editions={categoryManifestations}
          shown={manifestation}
          recommended={recommended}
        />
      )}
    </div>
  )
}
