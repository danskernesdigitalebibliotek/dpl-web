import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Actor, AnyActorLogic } from "xstate"

export const navigateToSearch = (
  q: string,
  actor: Actor<AnyActorLogic>,
  router: AppRouterInstance
) => {
  if (!q) return
  actor.send({ type: "SEARCH" })
  router.push(`/search?q=${q}`, {
    scroll: false,
  })
}
