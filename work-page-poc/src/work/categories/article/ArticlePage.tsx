import { useState } from "react"
import { Link, useSearchParams } from "react-router"

import type { CategoryPageProps } from "../types"
import { pickFastestAccess } from "./accessWays"
import { AccessActions } from "./AccessActions"
import { getArticleTypeLabel, getDetailRows, getEditionValue, getHostDetail } from "./articleText"
import { DetailList } from "./DetailList"
import { EditionPicker } from "./EditionPicker"

/**
 * The article concept from the designer's "Materialeside – Udgavevælger"
 * artifact: the mobile article boards, laid out on desktop like its
 * "Flere formater" desktop board.
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
  const hasOtherEditions = categoryManifestations.length > 1
  const recommended = pickFastestAccess(categoryManifestations)
  const isRecommended = recommended.pid === manifestation.pid
  const cover = manifestation.cover.detail_500 ?? manifestation.cover.detail_207

  return (
    <div className="bg-surface-page font-body text-text-heading">
      <main className="mx-auto max-w-[1440px]">
        <section
          aria-labelledby="article-title"
          className="grid grid-cols-1 gap-x-16 gap-y-6 px-4 pt-8 pb-12 [grid-template-areas:'media'_'title'_'action'] md:grid-cols-[minmax(0,1fr)_329px] md:px-12 md:pt-16 md:[grid-template-areas:'title_media'_'action_media'] wide:grid-cols-[minmax(0,1fr)_329px_minmax(0,1fr)] wide:items-center wide:[grid-template-areas:'title_media_action']"
        >
          <div className="flex flex-col items-center gap-6 [grid-area:media]">
            <div className="relative box-border flex aspect-[5/7] w-[203px] items-end overflow-hidden rounded-[3px] bg-brand-120 p-[18px] shadow-[0_2px_24px_rgba(0,0,0,0.08)] md:w-[329px]">
              {cover ? (
                <img src={cover} alt="" className="absolute inset-0 size-full max-w-none object-cover" />
              ) : (
                <span aria-hidden="true" className="font-heading text-xl leading-[26px] text-white">
                  {title}
                </span>
              )}
            </div>
            <span className="box-border inline-flex h-9 items-center rounded-lg border border-solid border-outline bg-surface-card px-3.5 text-[15px] leading-5 font-medium">
              {typeLabel}
            </span>
          </div>

          <div className="min-w-0 [grid-area:title]">
            <h1 id="article-title" className="m-0 font-heading text-[32px]/10 font-normal md:text-h1">
              {title}
            </h1>
            {creators.length > 0 && (
              <p className="m-0 mt-3 text-body-m text-text-body md:text-body-l">Af {creators.join(", ")}</p>
            )}
            {host && (
              <p className="m-0 mt-1 text-body-m text-text-body md:text-body-l">
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
          </div>

          <div className="min-w-0 [grid-area:action]">
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
        </section>

        {!!work.abstract?.length && (
          <section aria-labelledby="article-description" className="max-w-[800px] px-4 md:px-12">
            <h2 id="article-description" className="m-0 font-heading text-[28px] leading-8 font-normal">
              Beskrivelse
            </h2>
            {work.abstract.map((paragraph) => (
              <p key={paragraph} className="m-0 mt-5 text-body-l leading-7 text-text-body">
                {paragraph}
              </p>
            ))}
          </section>
        )}

        <section className="mx-4 mt-12 mb-16 max-w-[760px] border border-solid border-outline bg-surface-card md:mx-12">
          <h3 className="m-0">
            <button
              type="button"
              aria-expanded={isDetailsOpen}
              onClick={() => setIsDetailsOpen((isOpen) => !isOpen)}
              className={`box-border flex h-[72px] w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 text-left font-body text-body-l font-normal text-text-heading ${
                isDetailsOpen ? "shadow-[inset_0_-1px_0_var(--color-outline)]" : ""
              }`}
            >
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
