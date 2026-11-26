import { Link } from "react-router"

import type { CategoryPageProps } from "../types"
import { Availability } from "./Availability"

/** The scaffold's raw data page, for materials no concept covers yet. */
export const CatchRestPage = ({ work, manifestation, categoryManifestations }: CategoryPageProps) => (
  <main>
    <h1>{work.titles.full.join(" ")}</h1>
    <p>{work.creators.map((creator) => creator.display).join(", ")}</p>
    {work.abstract?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

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
        pids={categoryManifestations.map((candidate) => candidate.pid)}
        shownPid={manifestation.pid}
      />
    </section>

    <section>
      <h2>All manifestations</h2>
      <ul>
        {categoryManifestations.map((candidate) => (
          <li key={candidate.pid}>
            <Link to={{ search: `?manifestationId=${encodeURIComponent(candidate.pid)}` }}>
              {candidate.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(", ")}
              {candidate.edition?.summary ? ` – ${candidate.edition.summary}` : ""}
            </Link>
            {candidate.pid === manifestation.pid && " (shown)"}
          </li>
        ))}
      </ul>
    </section>
  </main>
)
