import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router"

import { useConnectionSettings } from "../connection/useConnectionSettings"
import { useWork } from "../fbi/useWork"
import { getCategory } from "./categories/registry"
import { selectManifestation } from "./selectManifestation"

/**
 * The page the redesign happens on. The manifestation is what the page is
 * about: `?manifestationId=` names it, and its category decides the page.
 */
export const WorkPage = () => {
  const { workId = "" } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { settings } = useConnectionSettings()
  const { data, isPending, error } = useWork(workId)

  const requestedId = searchParams.get("manifestationId")
  const work = data?.work
  const manifestation = work ? selectManifestation(work, requestedId) : undefined

  // Writes a default choice into the URL, so it always names what is shown.
  useEffect(() => {
    if (manifestation && manifestation.pid !== requestedId) {
      setSearchParams(
        (params) => {
          params.set("manifestationId", manifestation.pid)
          return params
        },
        { replace: true }
      )
    }
  }, [manifestation, requestedId, setSearchParams])

  if (!settings.libraryToken) return <p>Add a library token under connection settings (⚙) to load the work.</p>
  if (error) return <p>Could not load the work: {error.message}</p>
  if (isPending) return <p>Loading…</p>
  if (!work) return <p>No work with id {workId}.</p>
  if (!manifestation) return <p>The work has no manifestations.</p>

  const category = getCategory(manifestation)
  const { Page } = category

  return (
    <Page
      work={work}
      manifestation={manifestation}
      categoryManifestations={work.manifestations.all.filter(category.matches)}
    />
  )
}
