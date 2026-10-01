import { createStore } from "@xstate/store"

// What the global player bar is playing. The store only decides *whether and
// what* plays — minimised/expanded is internal state in the WeDoBooks player
// bar, which owns everything inside its container.
//
// Exactly one of `loanId`/`materialId` is set while playing: a loan plays the
// full audiobook, a material id plays the sample. A new play replaces the
// current one — one active playback at a time.
type TContext = {
  loanId: string | null
  materialId: string | null
}

const playerStore = createStore({
  context: {
    loanId: null,
    materialId: null,
  } as TContext,
  on: {
    playLoan: (_context, event: { loanId: string }) => ({
      loanId: event.loanId,
      materialId: null,
    }),
    playSample: (_context, event: { materialId: string }) => ({
      loanId: null,
      materialId: event.materialId,
    }),
    close: () => ({
      loanId: null,
      materialId: null,
    }),
  },
})

export const playLoan = (loanId: string) => playerStore.trigger.playLoan({ loanId })

export const playSample = (materialId: string) => playerStore.trigger.playSample({ materialId })

export const closePlayer = () => playerStore.trigger.close()

export { playerStore }
