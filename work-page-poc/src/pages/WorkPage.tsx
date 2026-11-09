import { Link, useParams, useSearchParams } from "react-router"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { useWork } from "../fbi/useWork"
import { Availability } from "./Availability"

/**
 * The page the redesign happens on. `?manifestationId=` picks the manifestation
 * shown; without it, FBI's best representation is used.
 */
export const WorkPage = () => {
  const { workId = "" } = useParams()
  const [searchParams] = useSearchParams()
  const { settings } = useConnectionSettings()
  const { data, isPending, error } = useWork(workId)

  if (!settings.libraryToken) return <p>Paste a library token above to load the work.</p>
  if (error) return <p>Could not load the work: {error.message}</p>
  if (isPending) return <p>Loading…</p>
  if (!data.work) return <p>No work with id {workId}.</p>

  const { work } = data
  const manifestationId = searchParams.get("manifestationId") ?? work.manifestations.bestRepresentation.pid
  const manifestation =
    work.manifestations.all.find((candidate) => candidate.pid === manifestationId) ??
    work.manifestations.all[0]

  return (
    <main>
      <h1>{work.titles.full.join(" ")}</h1>
      <p>{work.creators.map((creator) => creator.display).join(", ")}</p>
      {work.abstract?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      {manifestation && (
        <section>
          <h2>Shown manifestation</h2>
          {manifestation.cover.detail_207 && <img src={manifestation.cover.detail_207} alt="" />}
          <p>
            {manifestation.titles.full.join(" ")}
            <br />
            {manifestation.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(", ")}
            <br />
            {manifestation.edition?.summary}
          </p>
          <Availability
            workId={work.workId}
            pids={work.manifestations.all.map((candidate) => candidate.pid)}
            shownPid={manifestation.pid}
          />
        </section>
      )}

      <section>
        <h2>All manifestations</h2>
        <ul>
          {work.manifestations.all.map((candidate) => (
            <li key={candidate.pid}>
              <Link to={{ search: `?manifestationId=${encodeURIComponent(candidate.pid)}` }}>
                {candidate.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(", ")}
                {candidate.edition?.summary ? ` – ${candidate.edition.summary}` : ""}
              </Link>
              {candidate.pid === manifestation?.pid && " (shown)"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
