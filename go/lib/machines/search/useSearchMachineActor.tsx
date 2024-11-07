"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ReadonlyURLSearchParams, useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnyEventObject, createActor } from "xstate"

import { getFacetsForSearchRequest } from "@/components/pages/searchPageLayout/helper"
import goConfig from "@/lib/config/config"

import searchMachine from "./search.machine"

const searchActor = createActor(searchMachine, {
  input: {
    initialOffset: goConfig<number>("search.offset.initial"),
    searchPageSize: goConfig<number>("search.item.limit"),
    facetLimit: goConfig<number>("search.facet.limit"),
  },
}).start()

/**
 *
 * This hook is referencing the searchActor from the search.machine.ts file.
 *
 * The reason why we are using a ref is because we want to keep the same actor instance.
 *
 * The bootstrap state is used to set the initial filters and search string from the URL.
 *
 * Furthermore the queryClient is set to the actor context
 * so we are able to use it in queries inside the machine.
 */
const useSearchMachineActor = () => {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [isBootstrapped, setIsBootstrapped] = useState(false)
  const router = useRouter()
  const actorRef = useRef(searchActor)
  const actor = actorRef.current

  useEffect(() => {
    if (!actor.getSnapshot().matches("bootstrap") || isBootstrapped) {
      return
    }

    const q = searchParams.get("q")
    const filters = getFacetsForSearchRequest(searchParams as ReadonlyURLSearchParams)

    if (filters) {
      actor.send({ type: "SET_INITIAL_FILTERS", filters })
    }
    if (q) {
      actor.send({ type: "SET_SEARCH_STRING", q })
    }

    actor.send({ type: "SET_QUERY_CLIENT", queryClient })

    setIsBootstrapped(true)
  }, [isBootstrapped])

  // Administer search query params when filters are toggled.
  actor.on("filterToggled", (emittedEvent: AnyEventObject) => {
    const params = new URLSearchParams(searchParams.toString())

    const {
      toggled: { name: filterName, value: filterValue },
    } = emittedEvent

    if (params.has(filterName, filterValue)) {
      params.delete(filterName, filterValue)
    } else {
      params.append(filterName, filterValue)
    }

    const searchParamsString = params.toString()
    router.push("/search" + searchParamsString ? `?${searchParamsString}` : "", {
      scroll: false,
    })
  })

  return actor
}

export default useSearchMachineActor
