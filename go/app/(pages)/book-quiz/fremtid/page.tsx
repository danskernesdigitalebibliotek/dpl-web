import { Metadata } from "next"
import Link from "next/link"

import { setPageMetadata } from "@/lib/helpers/helper.metadata"

export const metadata: Metadata = setPageMetadata("Boganbefaler-quiz – Fremtidig optimering")

type TItem = {
  title: string
  status: string
  problem: string
  notes: string[]
}

// Parkerede emner fra gennemgangen: ting der hører til rigtig implementering,
// ikke til selve PoC-mekanikken. Nye punkter tilføjes her efterhånden.
const items: TItem[] = [
  {
    title: "Tilgængelighed / beholdning",
    status: "Parkeret",
    problem:
      "Quizzen anbefaler på tværs af alle FBI-værker uden at tjekke, om biblioteket har eller kan " +
      "udlåne bogen. På et bibliotekssite er det en dårlig oplevelse at anbefale noget, barnet ikke " +
      "kan låne.",
    notes: [
      "Niveau A (nuværende i PoC): vis bare det der findes i FBI.",
      "Niveau B: behold alle resultater, men markér/sortér efter tilgængelighed.",
      "Niveau C: hårdt filter — søg kun i det der kan lånes nu.",
      "Kræver et beholdnings-/holdings-opslag pr. værk (FBS/holdings) — ikke nødvendigvis 1:1 i " +
        "complexSearch. Datakilden skal afklares før implementering.",
    ],
  },
  {
    title: "Flere filtre og sorteringsmuligheder",
    status: "Idé",
    problem:
      "Quizzen filtrerer i dag på genre/emne/materialetype (hårdt) og reranker blødt på lix/alder. " +
      "Der er potentiale for flere filtre og sorteringer, så anbefalingerne kan skræddersyes mere.",
    notes: [
      "Udgivelsesår / hvor ny bogen er — fx sortér nyeste først, eller filtrér til de sidste X år.",
      "Popularitet/udlånstal — populære titler først (kræver et udlåns-/popularitetssignal).",
      "Serier — mulighed for at prioritere (eller fravælge) bøger der indgår i en serie.",
      "Sprog og evt. længde (sideantal) — bemærk: boglængde er ikke en søgbar FBI-facet i dag.",
      "Beslut pr. mulighed om det skal være et HÅRDT filter eller en BLØD sortering/rerank.",
    ],
  },
  {
    title: "Quiz builder — kunden bygger sin egen quiz",
    status: "Idé",
    problem:
      "I dag er quizzen (spørgsmål, svar, mapping til genre/emne og score) hardkodet. En quiz-builder " +
      "ville lade bibliotekerne/redaktørerne selv bygge og tilpasse quizzer uden kodeændringer.",
    notes: [
      "Redigér spørgsmål, svar og hvad hvert svar peger på (genre/emne) — som debug-modulet, men i " +
        "et CMS-/redaktør-UI.",
      "Justér læse-type-scorer og personaer pr. quiz.",
      "Debug-modulet i PoC 6/7 er reelt en prototype på selve builderen (live mapping + score).",
      "Kræver datamodel + lagring i CMS (Drupal) og indlæsning i GO via GraphQL, i stedet for " +
        "hardkodet quiz.ts / allowedList.ts.",
      "Beslut hvor frit det skal være: fuldt redigerbart vs. kurateret/begrænset (allow-liste som " +
        "sikkerhedsnet mod ugyldige CQL-termer).",
    ],
  },
  {
    title: "Allow-listen skal ejes og bestemmes af kunden",
    status: "Parkeret",
    problem:
      "Allow-listen (de kuraterede genrer/emner, deres FBI-term-mapping, læse-type-scorer, emojis " +
      "og aldersgrænser) er i dag hardkodet og sat af udvikleren. Det er reelt et redaktionelt/" +
      "kuraterings-ansvar og bør defineres og bestemmes af kunden/bibliotekerne.",
    notes: [
      "Hvilke børnevendte labels (genrer/emner) der findes, er en kurateringsbeslutning.",
      "Mapping til FBI-termer (term vs. phrase) er skrøbelig: en forkert eller forældet term " +
        "fejler stille (0 hits uden fejl). Overvej et hit-count-tjek der validerer hver term mod FBI.",
      "Læse-type-scorer + personaer, emojis og aldersgrænser er også kuratering, kunden skal eje.",
      "Hænger sammen med quiz-builder-idéen: allow-listen lagres i CMS og indlæses i GO i stedet " +
        "for at være hardkodet.",
    ],
  },
]

const Page = () => {
  return (
    <section className="mx-auto my-8 w-full max-w-3xl px-4">
      <h1 className="text-2xl font-bold">Boganbefaler-quiz — Fremtidig optimering</h1>
      <p className="mt-2 opacity-70">
        Parkerede emner fra gennemgangen: ting der hører til rigtig implementering, ikke selve
        PoC-mekanikken.{" "}
        <Link className="underline" href="/book-quiz">
          Tilbage til PoC-oversigten
        </Link>
        .
      </p>
      <ol className="mt-6 flex flex-col gap-6">
        {items.map((item, index) => (
          <li key={item.title} className="flex flex-col gap-2 border border-black/20 p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold">
                {index + 1}. {item.title}
              </h2>
              <span className="shrink-0 border border-black/30 px-2 py-0.5 text-xs opacity-70">
                {item.status}
              </span>
            </div>
            <p>{item.problem}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm opacity-80">
              {item.notes.map(note => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Page
