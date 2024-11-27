import { and, not } from "xstate"

import searchMachineSetup from "./search.machine.setup"

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0ANgCMAVlwAWAJzGATDIAcNmeYDM9zwBoQAT0QLAHZcYycnIKdTSNcndysAXwTfFAwcAmIyCmp6ZhZGAEFuAQAJfKZuEXEAcVkFJBBlNQ1tXQMEQytjS0cbKyCg0xdwpytzXwCEd2jcGxt3d1Gne273AaSUtCw8IlJySlpGViqRJhECoRYAMREhJh46Ot0m9U0dBvaTR1Cw0ysFpzmLxuCaIKxDXCmdw2cwyFamYyLKIbECpbYZPbZWgAIQA8rimHQKgUAAosAAiuPEDCeDReLXeoE+5iiuCC0Js9isK36phhoIQphkNlC4Ui0RczniphRaPSuyyBxoeIJRO4pIpVJppnqShUr1aHyMLNMbI5XJ5g35-kQZlFESiMSl4NlW3SqggABswDQmLjqtUhAxrrd7txaXrmm82oh4j17C47OYHE5jALHPZcOYuiNxXF3A5XWk8B7vb7-YHgzc7jwpDrnvqGTGEPYgiKvH1ls4gkDugLzBZcAWglygmE22ZjEX0aWfUxeCSqrV5A2o4amcbubM-vY5gsYQiggK21ZIcCZHDjD3wVPkqi3SWvT7CsUShHGo3o0apnEs64HDInj2KYfJxAKiIigOxh9DIgyptCMp3nKj5li+pR1rqH5roy+ixgMkLcjYCLmD2Ep2AKsS4BEMLsi4njuAO07uk+NBCLiBTkiwACyuLcDSK50p+664YKRG4LutjxPYXIXgO9gCiBcxUQ4V7TMsaw2EETF4AAZqonokGA6CqFoUAFFoEB0A+JlQDQEDaGAuDkKghlOQ+uB6QZRk2eZlnWaZ770l+G4dHyMhZuYLJtqmbh-DIVj9qebgjmMgJcg4XTaR5+mGcZpm+VZxY2W5xYldsNl2Q5uAmQAboQADWjnIdlXl5WZFmFeVpllekyE2QgtWEJgLlvHUgVCTh7RCsmsx2MKazjDaLZWE4sz2CRUTrVlnm5T5HX+VAPV4H1pk0EZ6CEOguBUJ6Lk6ZdAC2R0tbt+X7UV3XNSdUADVodXDQyY0CZGBqTYgowhHB7L9OCwHCgpfSzHC8QLdtOXeW9fkfYdO1GS9GO2fZWiOYNjXPbjbUFQd+NXRT-WDQDo3yON2HNkKKzWOt4rrf2QThZKDjmGjrV7VjXU4+jtOSxV52Xddt0kPd6BPc1dOY51ODFRTNP039Q0jdoQOYUFwntBD1hxYL-YIspUNC0h7meoQqAQDZXGXWAGvYNwcAAK4GbAR0VUTJN62TzVOy7bse17PuwP7ZBB6Zv3-QbWhG6uoPNoYfLGNYxjxcY-TmPMnhDBR3zrdmfJ2Ms2b25spWR67pnu+gnsPnHCeB99Z3oBdV03Xdj3Pc30ft7HfsB0nP0M2nGeCaz345wmZ6bbBrYeFYYwKV47jiV0wF-HEfwWEkd5aIQEBwLoyGZ02y+AvvEStsORdWotkwr6e7LJpyXbQSFDYLKCp9jUHvsFEShgnBuCoiOdkV5358k-kYNY4kGJ823utQWMJEgO1KrOCBpsjCmEzOEZMk4xhXjiGEcCMg85rDiAOEu8VhR4MbuiNW7Uxaa1MkQsGCB2QhGBDmHsCMkZeC8DA2EJFuzC1etwr2xU76Lyzt+SIlgPDMKtktIUIQrDI0igxSSK0G73lKlwqm2NnrfX4c2fMWYGIWB0ZMUc1hkb-B7PIgmVjxbPRDnY78pDIhmhPtEK8G1TDpmgqEIEKMvH4M4dLdW1MKaBJCho9BhcIgoIQIRIcV4LTrU0jDW8HD0iWPen47WXD0kiQcSI8cuS-4FLtt4ymVTeES1argAJqiH4hVIQYrMwwgjcgieKfsYkzBtMSekMercY6dynmQOpnxbAiihCXBY0kezxB3rov4lgxkqQygmFwWUFlQDbh3YsXdp62P6ZA9ZA5IQMVLrsreBzJikIWAfBwIEVrTHBPbJIQA */
  id: "search",
  initial: "bootstrap",
  context: ({ input }) => ({
    searchOffset: input.initialOffset ?? 0,
    searchPageSize: input.searchPageSize,
    facetLimit: input.facetLimit,
    currentQuery: input.q ?? "",
    submittedQuery: undefined,
    searchData: undefined,
    facetData: undefined,
    selectedFilters: input.filters ?? {},
    queryClient: input.queryClient ?? null,
  }),
  states: {
    bootstrap: {
      on: {
        SET_QUERY_CLIENT: {
          actions: ["setQueryClientInContext"],
        },
        SET_SEARCH_STRING: {
          actions: ["setCurrentQueryInContext", "setSubmittedQueryInContext"],
        },
        SET_INITIAL_FILTERS: {
          actions: ["setInitialFiltersInContext"],
        },
        BOOTSTRAP_DONE: [
          {
            guard: and(["contextHasQueryClient", "contextHasSearchString"]),
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
      },
    },
    idle: {
      on: {
        TOGGLE_FILTER: [
          {
            guard: "contextHasSearchString",
            actions: ["resetSearchData", "toggleFilterInContext", "emitFilterToggled"],
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
        TYPING: [
          {
            actions: ["setCurrentQueryInContext"],
          },
        ],
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: ["resetSearchData", "resetFilters", "setSubmittedQueryInContext"],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
        LOAD_MORE: {
          guard: and(["contextHasSearchString", not("maxLimitReached")]),
          actions: ["setLoadMoreValuesInContext"],
          target: "loadingMoreSearchResults",
        },
      },
    },
    filteringAndSearching: {
      type: "parallel",
      initial: "search",
      states: {
        search: {
          initial: "searching",
          guard: "contextHasQueryClient",
          states: {
            searching: {
              invoke: {
                src: "performSearch",
                input: ({ context }) => {
                  if (!context.queryClient) {
                    throw new Error("QueryClient is not set in context.")
                  }

                  return {
                    q: context.currentQuery,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
                    offset: context.searchOffset,
                    limit: context.searchPageSize,
                  }
                },
                onDone: {
                  actions: ["setSearchDataInContext"],
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
        filter: {
          initial: "filtering",
          states: {
            filtering: {
              invoke: {
                src: "getFacets",
                input: ({ context }) => {
                  if (!context.queryClient) {
                    throw new Error("QueryClient is not set in context.")
                  }
                  return {
                    q: context.currentQuery,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
                    facetLimit: context.facetLimit,
                  }
                },
                onDone: {
                  actions: ["setFacetDataInContext"],
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
      },
      onDone: {
        target: "#search.idle",
      },
    },
    loadingMoreSearchResults: {
      initial: "searching",
      guard: "contextHasQueryClient",
      states: {
        searching: {
          invoke: {
            src: "performSearch",
            input: ({ context }) => {
              if (!context.queryClient) {
                throw new Error("QueryClient is not set in context.")
              }
              return {
                q: context.currentQuery,
                queryClient: context.queryClient,
                filters: context.selectedFilters,
                offset: context.searchOffset,
                limit: context.searchPageSize,
              }
            },
            onDone: {
              actions: ["setSearchDataInContext"],
              target: "#search.idle",
            },
            onError: {},
          },
        },
      },
    },
  },
})
