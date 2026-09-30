import { z } from "zod"

import type { OpenType } from "../../../src/types"

const warned = new Set<string>()

// A string field the adapter's spec closes to a set of values, parsed as open:
// the adapter has sent values outside its own spec (a podcast loan), and one
// such value must not fail the whole response and take every material in it
// down with it. An unknown value is passed through as-is and logged once, not
// on every refetch.
export const openEnum = <const T extends readonly string[]>(field: string, known: T) =>
  z.string().transform((value): OpenType<T[number]> => {
    if (known.includes(value)) return value

    const key = `${field}:${value}`
    if (!warned.has(key)) {
      warned.add(key)
      console.warn(`Biblio adapter sent an unknown ${field}: "${value}"`)
    }
    return value
  })
