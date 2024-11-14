import { and, not } from "xstate"

import searchMachineSetup from "./search.machine.setup"

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0ANgCMAVlwAWAJzGATDIAcNmeYDM9zwBoQAT0QLAHZcYycnIKdTSNcndysAXwTfFAwcAmIyCmp6ZhZGAEFuAQAJfKZuEXEAcVkFJBBlNQ1tXQMEQytjS0cbKyCg0xdwpytzXwCEd2jcGxt3d1Gne273AaSUtCw8IlJySlpGViqRJhECoRYAMREhJh46Ot0m9U0dBvaTR1Cw0ysFpzmLxuCaIKxDXCmdw2cwyFamYyLKIbECpba4VQQAA2YBoTAA8tVqkIGNdbvduE8Gi8Wu9QO17F5cOZYvYgmFjMYZAtQQghvZcKNzEEbIN3MKrP9jCi0elMTi8YTiaSbnceFJTPUlCpXq0Pog2TZcF4+stnEEgd1eeYLLh3MYgvZ+mERWZpclUVs5djcUxeAAFKq1eTPHW0tpGcxWAU2P72OYLGEIoK8kVWSHAmRwh1RhEyr14eW4wrFEpU7XNN4RqZxZmuBzcxmmUw2OK8xFGm3GPoyQZODumfNpQs+3JFUoarWNMNV-VTAaQ6Ox7oW6IuYy82KCkXCxbzLw2ofoos0IT4goAERYAFl8dwGOXp5W9fTArHjX15tGnVmbfZec2cyCg4DrTMsayike6QAGaqFiJBgOgqhaFABRaBAdAFshUA0BA2hgLg5CoAhhEFrgsHwYh2FoRhWEoY+NKzq+HQtjIzLmOYEStlyNpWDIVjWumbiOmMgJOg4XRQXgFEIUhKE0Zhw7YaRw4qds2G4fhGJaAAboQADWBGytJcGydR6GKepKFqekxnYQgyF6ZgxFvHUDEzi++iBG4xizHYMjzBavJOk4sz2MKUThVJ5GmVR8kWXRUA2XgdkoTQiHoIQ6C4FQWLEdBWUALbJTFlFyahCVKdZxnJfZjmEM5tJuSG1IeXSXkIKMIR9kE8RBOC9imAFAF9LMcLxGs5jRTJcUVbRVVJTN2VLRpeFaAR9WGSVK3xfNVmLbFy2HXVukNS52jNVOjGee0Q0rNY4WRKY4XWkEbEuDIDhTR6NU7XNlk4MpS2lWZaUZVlOV5SQBXoMVv3HbtAPYEDh0g7NDmnY1rnyO5z7te0XXWH8n0vf4iBdsBPXfZsqlYoQqAQNh15ZWASPcHAACu8GwLVaVrRtp1bTVdMM0zLNs5z3O81AGNOedWiXaGePVoYLa+V0-HGP0LILINTibt84W5nMYThWM0Ui4zKHM+grMFuzsBc2Q0vpegmXZbl+VFSVlti7bEuO1LqUy-VWMXTjLUVrq+NGM9oVx89vZsh4krjGTfJeO4xpdINfxxH8FhJB6WiEBAcC6MZSvRyrgJZxEbL2uy-Qtmnkyq06uC9cKQ2cv1tiHj9ZG7FkBxV+Gc6GE4bjbg3Dpa4MMK8oYazGuKb2SuFX0wokg+qUWY9MR17eCoCnIImMDpxGE7afXakTihYrh8X000I-9iUHzdiC9SEwJdBErc3xjR-IyN64RRKvzKuZPagNqoFk-jHBAkRLAeBtOYL6AFezWHGr1GQQ0N7xkgaDd+C0SrBwQdWOIWdUEWAwenJ0IQ+JeH+BaIhs0FKJRKvzChc5nqRE7osaY0QcxPWCt2UIQIJqsN3uiP6HDSFLR4cxZBq9NYAN5EuO0oF0G9k4n0QcMiYJv3kftNGR0oEoSUR1Khqj-5BXTugo0jchjSJprI4xlVTHA24a1ZWvCfzMmGP1FYFpREOPfGYKmFt6ZWygDbO2w4HZO3gL46uE9bBGihDrTwyd4hjAAn8Sw-UJK9n+JxNY0TRbW3FvbSWztyGpPHsxToNpITinmDki0eTAEZwWNnBwzYrD53BN9JIQA */
  id: "search",
  initial: "bootstrap",
  context: ({ input }) => ({
    searchOffset: input.initialOffset ?? 0,
    searchPageSize: input.searchPageSize,
    facetLimit: input.facetLimit,
    currentQuery: input.q ?? "",
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
          actions: ["assignQueryToContext"],
        },
        SET_INITIAL_FILTERS: {
          guard: "contextHasQueryClient",
          actions: ["setInitialFiltersInContext"],
          target: "filteringAndSearching",
        },
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
        TYPING: {
          actions: ["assignQueryToContext"],
        },
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: ["resetSearchData", "resetFilters"],
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
