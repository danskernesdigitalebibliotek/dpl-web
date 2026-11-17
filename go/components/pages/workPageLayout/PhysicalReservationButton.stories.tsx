import {
  type MaterialAvailability,
  type RecordAvailability,
  loansQueryKey,
  materialAvailabilityQueryKey,
  reservationsQueryKey,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import type { QueryClient } from "@tanstack/react-query"

import { PhysicalReservationButton } from "@/components/pages/workPageLayout/WorkPageButtonsLoggedIn"
import { withServiceLayer } from "@/components/shared/physicalLoanSlider/physicalLoanStoryFixtures"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import {
  type ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

const FAUST = "22252852"
const WORK_ID = `work-of:870970-basis:${FAUST}`
const PID = `870970-basis:${FAUST}`

// A physical edition: the material type is what decides whether FBS is asked
// about it at all. The Cypress factory builds a narrower manifestation than
// the work page fragment, so the fields only that fragment carries are added.
const manifestation: ManifestationWorkPageFragment = {
  ...eBookManifestationFactory.build({
    pid: PID,
    materialTypes: [
      {
        materialTypeGeneral: { display: "bøger", code: "BOOKS" },
        materialTypeSpecific: { code: "BOOK", display: "bog" },
      },
    ],
  }),
  titles: { full: ["Vildheks"], identifyingAddition: null },
  series: [],
  subjects: { all: [] },
}

// The button derives the record id from the work query, so that has to answer
// before availability is asked about anything.
const seedWork = (client: QueryClient) => {
  client.setQueryData(useGetMaterialQuery.getKey({ wid: WORK_ID }), {
    work: { workId: WORK_ID, manifestations: { all: [manifestation] } },
  })
}

// `isEditionHidden` is true only when the kommune holds no copies *and* FBS
// will not reserve it — the two together are what "cannot be supplied" means.
const buildAvailability = (record: Partial<RecordAvailability>): MaterialAvailability => {
  const full: RecordAvailability = {
    recordId: FAUST,
    totalCopies: 0,
    availableCopies: 0,
    reservationCount: 0,
    reservable: false,
    ...record,
  }
  return {
    totalCopies: full.totalCopies,
    reservationCount: full.reservationCount,
    records: { [FAUST]: full },
  }
}

// Loans and reservations are checked before the unobtainable branch, so an
// empty answer for both is what lets it render at all.
const seed = (availability: MaterialAvailability) => (client: QueryClient) => {
  // Seeded data is stale the moment it lands, so the hooks would refetch it
  // against an FBS that does not exist here and land in an error state —
  // which the button reads as "availability unknown" and shows every edition
  // as reservable. Never refetching is what keeps the seed in place.
  client.setDefaultOptions({ queries: { staleTime: Infinity, retry: false } })
  seedWork(client)
  client.setQueryData(loansQueryKey(), [])
  client.setQueryData(reservationsQueryKey(), [])
  client.setQueryData(materialAvailabilityQueryKey(WORK_ID, [FAUST], []), availability)
}

const meta = {
  title: "Pages/WorkPage/PhysicalReservationButton",
  component: PhysicalReservationButton,
  // Mirrors WorkPageButtons, which is the only place the work page renders
  // this and which owns the spacing between the help text and the button.
  // Its `lg:items-end` is left out on purpose: right-aligning belongs to the
  // work page layout, not to this component.
  decorators: [
    Story => (
      <div className="flex w-full flex-col space-y-3">
        <Story />
      </div>
    ),
  ],
  args: {
    dataCy: "reserve-button",
    label: "bogen",
    workId: WORK_ID,
    selectedManifestation: manifestation,
    reservationModal: "ReservationModal" as const,
    onOpen: () => {},
  },
} satisfies Meta<typeof PhysicalReservationButton>

export default meta
type Story = StoryObj<typeof meta>

// The dead end described in ADR-012: a shared link pinned an edition the
// kommune cannot supply, so the pin wins over the default pick and the reader
// is told to choose another edition rather than having their choice swapped.
export const Unobtainable: Story = {
  decorators: [withServiceLayer(seed(buildAvailability({})))],
}

// The ordinary case, for contrast: the kommune holds it and it is on the shelf.
export const Obtainable: Story = {
  decorators: [
    withServiceLayer(
      seed(buildAvailability({ totalCopies: 3, availableCopies: 2, reservable: true }))
    ),
  ],
}

// Held but every copy is out. Still reservable, so the button stays a normal
// reserve action — being lent out is not a dead end.
export const LentOut: Story = {
  decorators: [
    withServiceLayer(
      seed(buildAvailability({ totalCopies: 2, reservationCount: 4, reservable: true }))
    ),
  ],
}
