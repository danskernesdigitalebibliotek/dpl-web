import { expect, test } from "vitest"

import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import {
  getIsbnsFromManifestation,
  getIsbnsFromWork,
  getPublizonIdentifierFromManifestation,
} from "@/lib/helpers/ids"

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

test("getPublizonIdentifierFromManifestation prefers the PUBLIZON identifier", async () => {
  const manifestation = {
    pid: "870970-basis:139675622",
    identifiers: [
      {
        type: "ISBN",
        value: "9788797287996",
      },
      {
        type: "PUBLIZON",
        value: "9788797577646",
      },
    ],
  } as ManifestationWorkPageFragment

  expect(getPublizonIdentifierFromManifestation(manifestation)).toBe("9788797577646")
})

test("getPublizonIdentifierFromManifestation falls back to ISBN when no PUBLIZON identifier", async () => {
  const manifestation = {
    pid: "870970-basis:139675622",
    identifiers: [
      {
        type: "ISBN",
        value: "9788797287996",
      },
    ],
  } as ManifestationWorkPageFragment

  expect(getPublizonIdentifierFromManifestation(manifestation)).toBe("9788797287996")
})

test("getPublizonIdentifierFromManifestation returns the PUBLIZON value when there is no ISBN", async () => {
  const manifestation = {
    pid: "870970-basis:29142246",
    identifiers: [
      {
        type: "PUBLIZON",
        value: "9788711402740",
      },
    ],
  } as ManifestationWorkPageFragment

  expect(getPublizonIdentifierFromManifestation(manifestation)).toBe("9788711402740")
})

test("getPublizonIdentifierFromManifestation returns undefined when there is no usable identifier", async () => {
  const manifestation = {
    pid: "870970-basis:29142246",
    identifiers: [],
  } as unknown as ManifestationWorkPageFragment

  expect(getPublizonIdentifierFromManifestation(manifestation)).toBeUndefined()
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
