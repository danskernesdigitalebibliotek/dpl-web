import { expect, test } from "vitest"

import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getIsbnsFromManifestation, getIsbnsFromWork } from "@/lib/helpers/ids"

test("test that we can get isbns from manifestation", async () => {
  const manifestation = {
    pid: "870970-basis:29142246",
    identifiers: [
      {
        type: "PUBLIZON",
        value: "9788711402740",
      },
      {
        type: "ISBN",
        value: "9788711402740",
      },
      {
        type: "ISBN",
        value: "9788711402742",
      },
    ],
  } as ManifestationWorkPageFragment

  const isbns = getIsbnsFromManifestation(manifestation)

  expect(isbns).toStrictEqual(["9788711402740", "9788711402742"])
})

test("test that we get empty isbns when only having publizon identifiers", async () => {
  const manifestation = {
    pid: "870970-basis:29142246",
    identifiers: [
      {
        type: "PUBLIZON",
        value: "9788711402740",
      },
    ],
  } as ManifestationWorkPageFragment

  const isbns = getIsbnsFromManifestation(manifestation)

  expect(isbns).toStrictEqual([])
})

test("test that we get an array of isbns string from work object", async () => {
  const work = {
    manifestations: {
      all: [
        {
          pid: "870970-basis:29142246",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788711402740",
            },
            {
              type: "ISBN",
              value: "9788711402740",
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                display: "e-bøger",
                code: "EBOOKS",
              },
            },
          ],
        },
      ],
      bestRepresentation: {},
    },
  } as Pick<WorkTeaserSearchPageFragment, "manifestations">

  const isbns = getIsbnsFromWork(work as WorkFullWorkPageFragment)

  expect(isbns).toStrictEqual(["9788711402740"])
})
