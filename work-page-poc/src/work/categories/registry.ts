import type { Manifestation } from "../../fbi/types"
import { articleCategory } from "./article/articleCategory"
import { catchRestCategory } from "./catchRest/catchRestCategory"
import type { ManifestationCategory } from "./types"

// Checked in order; the catch-rest category matches everything and stays last.
const categories: ManifestationCategory[] = [articleCategory, catchRestCategory]

/** The category a manifestation belongs to. */
export const getCategory = (manifestation: Manifestation) =>
  categories.find((category) => category.matches(manifestation)) ?? catchRestCategory
