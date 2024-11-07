"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ReadonlyURLSearchParams, useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createActor } from "xstate"

import { getFacetsForSearchRequest } from "@/components/pages/searchPageLayout/helper"

import searchMachine from "./search.machine"

const searchActor = createActor(searchMachine, {
  input: {},
}).start()

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
  actor.on("filterToggled", emittedEvent => {
    const params = new URLSearchParams(searchParams.toString())

    // TODO: Fix type problem here
    const {
      // @ts-ignore
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
