"use client"

import { useQueryClient } from "@tanstack/react-query"
import _ from "lodash"
import { ReadonlyURLSearchParams } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnyEventObject, createActor } from "xstate"

import { getFacetsForSearchRequest } from "@/components/pages/searchPageLayout/helper"
import goConfig from "@/lib/config/goConfig"

import searchMachine from "./search.machine"

const searchActor = createActor(searchMachine, {
  input: {
    initialOffset: goConfig("search.offset.initial"),
    searchPageSize: goConfig("search.item.limit"),
    facetLimit: goConfig("search.facet.limit"),
  },
  // Uncomment this line to enable event debugging.
  // inspect: debugEvents,
}).start()

// Administer search query params when filters are toggled.
searchActor.on("filterToggled", (emittedEvent: AnyEventObject) => {
  const url = new URL(window.location.href)
  const {
    toggled: { name: filterName, value: filterValue },
  } = emittedEvent

  if (url.searchParams.has(filterName, filterValue)) {
    url.searchParams.delete(filterName, filterValue)
  } else {
    url.searchParams.append(filterName, filterValue)
  }

  window.history.pushState({}, "", url.href)
})

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
  const actorRef = useRef(searchActor)
  const actor = actorRef.current

  useEffect(() => {
    if (!actor.getSnapshot().matches("bootstrap") || isBootstrapped) {
      return
    }

    const q = searchParams.get("q")
    const filters = getFacetsForSearchRequest(searchParams as ReadonlyURLSearchParams)

    if (!_.isEmpty(filters)) {
      actor.send({ type: "SET_INITIAL_FILTERS", filters })
    }
    if (q) {
      actor.send({ type: "SET_SEARCH_STRING", q })
    }

    actor.send({ type: "SET_QUERY_CLIENT", queryClient })

    actor.send({ type: "BOOTSTRAP_DONE" })

    setIsBootstrapped(true)
    // We choose to ignore the eslint warning below
    // because we want to make sure it only reruns if isBootstrapped changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBootstrapped])

  return actor
}

export default useSearchMachineActor
