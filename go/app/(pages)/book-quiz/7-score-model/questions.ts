import { QUESTIONS as BASE_QUESTIONS, TQuizQuestion } from "../6-flow/quiz"

// PoC 7: genbrug genre/emne-trinnene fra PoC 6, men erstat det samlede
// "laesetype"-trin med eksplicitte LÆSEPRÆFERENCE-trin (alder + lix). De kommer
// FØRST, fordi de styrer hvilke genrer/emner der vises bagefter (alderen gater
// alderssvarende valg). Begge er ellers bløde signaler (rerank), ikke filtre.

const AGE_STEP: TQuizQuestion = {
  id: "alder",
  title: "Hvad alderstrin, du vil læse på?",
  multi: true,
  options: [
    { id: "alder-6", label: "5-6 år", age: "6 år" },
    { id: "alder-8", label: "7-8 år", age: "8 år" },
    { id: "alder-10", label: "9-10 år", age: "10 år" },
    { id: "alder-12", label: "11-12 år", age: "12 år" },
    { id: "alder-14", label: "13-14 år", age: "14 år" },
  ],
}

const LIX_STEP: TQuizQuestion = {
  id: "lix",
  title: "Hvor meget kan du lide at læse?",
  multi: true,
  options: [
    { id: "lix-let", label: "Jeg vil have det let", emoji: "😌", lix: "10" },
    { id: "lix-mellem", label: "Midt imellem", emoji: "🙂", lix: "20" },
    { id: "lix-svaer", label: "Jeg læser gerne svært", emoji: "💪", lix: "35" },
  ],
}

// Læsepræferencerne (alder, lix) kommer først, derefter genre/emne-trinnene.
export const QUIZ_QUESTIONS: TQuizQuestion[] = [
  AGE_STEP,
  LIX_STEP,
  ...BASE_QUESTIONS.filter(question => question.id !== "laesetype"),
]

// Ids på læsepræference-trinnene (bruges til at indsætte custom-trin efter dem).
export const PREFERENCE_STEP_IDS = [AGE_STEP.id, LIX_STEP.id]
