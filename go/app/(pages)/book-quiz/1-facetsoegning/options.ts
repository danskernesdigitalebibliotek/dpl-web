// Rå FBI-termer for PoC 1. PoC 1 bruger termerne direkte — en kurateret
// tilladt-liste (med label → FBI-værdi, emoji og score) kommer i PoC 2.
// Enkeltords-værdier er valgt, så term.subject / term.genreandform matcher rent
// (flerords-emner kræver phrase.subject, hvilket håndteres i PoC 2).

export const GENRE_OPTIONS = ["fantasy", "gys", "spænding", "romaner", "billedbøger", "tegneserier"]

export const SUBJECT_OPTIONS = ["venskab", "magi", "uhyggelig", "sjov", "dyr", "familien"]

export const MATERIAL_TYPE_OPTIONS = ["bog", "e-bog", "lydbog (online)"]

// Bløde signaler: indgår ikke i filteret, men bruges til at sortere (rerank)
// resultatet efter nærhed til valgt niveau.
export const AGE_OPTIONS = ["fra 6 år", "fra 9 år", "fra 12 år"]

export const LIX_OPTIONS = ["10", "20", "30"]

// Længde vises i dashboardet, men kan IKKE bruges: FBI har ingen facet for
// boglængde (sideantal findes kun på manifestationen og kan ikke søges/sorteres).
export const LENGTH_OPTIONS = ["Kort (< 100 sider)", "Mellem (100–250)", "Lang (> 250)"]
