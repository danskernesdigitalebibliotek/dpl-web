"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useSelector } from "@xstate/react"
import _ from "lodash"
import { ReadonlyURLSearchParams, usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnyEventObject, createActor } from "xstate"

import goConfig from "@/lib/config/goConfig"

import { transformSearchParamsIntoFilters } from "./helpers"
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
  const pathname = usePathname()
  const isSearchPage = (path: string) => path === `/${goConfig("routes.search")}`
  const [previousPathname, setPreviousPathname] = useState<string | undefined>(undefined)
  const searchParamString = searchParams.toString()
  const queryClient = useQueryClient()
  const actorRef = useRef(searchActor)
  const actor = actorRef.current
  const storedQueryClient = useSelector(actor, snapshot => {
    return snapshot.context.queryClient
  })

  // Handle bootstrapping of the machine.
  useEffect(() => {
    // We are only interested in bootstrapping the search machine
    // if we are on the search page.
    if (!isSearchPage(pathname)) {
      return
    }

    if (!actor.getSnapshot().matches("bootstrap")) {
      return
    }
    const q = searchParams.get("q")
    const filters = transformSearchParamsIntoFilters(searchParams as ReadonlyURLSearchParams)

    if (!_.isEmpty(filters)) {
      actor.send({ type: "SET_INITIAL_FILTERS", filters })
    }
    if (q) {
      actor.send({ type: "SET_SEARCH_STRING", q })
    }

    // Only set query client if it is not already set.
    if (!storedQueryClient) {
      actor.send({ type: "SET_QUERY_CLIENT", queryClient })
    }

    actor.send({ type: "BOOTSTRAP_DONE" })
  })

  // Handle route changes.
  // If the search query changes, reset the machine state.
  // This is necessary because the machine state is not reset when the URL changes.
  useEffect(() => {
    // We are only interested in rebooting the search machine
    // if we are on the search page.
    if (!isSearchPage(pathname)) {
      return
    }

    const currentPathname = `${pathname}${searchParamString}`
    if (previousPathname && currentPathname !== previousPathname) {
      actor.send({ type: "RESET_BOOTSTRAP_STATE" })
    }

    setPreviousPathname(currentPathname)
  }, [pathname, searchParamString, previousPathname, actor])

  return actor
}

export default useSearchMachineActor
