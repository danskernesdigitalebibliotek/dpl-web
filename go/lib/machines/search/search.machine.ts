import { assign, emit, setup } from "xstate"

import { getFacets, performSearch } from "./queries"
import searchMachineSetup from "./search.machine.setup"
import { TContext, TFilters, TInput } from "./types"

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0ANgAsATlwB2AMw2ArAA4Z5gEyOHN0wBoQATyN7G1xzGStzAEZbe1dI0NMAXwTfFAwcAmIyCmp6ZhZGAEFuAQAJfKZuEXEAcVkFJBBlNQ1tXQMEQ3sw63NzC3N7CONXe1MrXwCEe0sZRwGbPrjTYxkbJJS0LDwiUnJKWkZWKpEmEQKhFgAxESEmHjo63Sb1TR0G9pNXGVwY43tbGSmCIRGTDCaIKKWCKxaFfGyOCKmRymRLJECpLa4VQQAA2YBoTAA8tVqkIGFcbnduI8Gs8Wm9QO1XKZXLhnK5jFYvs4Yi57OCEKZQSFXHYbFYEf8kcZ1ujNulsXiCcTSeTrrceFIIvUlCoXq13ogOfZcLDZrYrIixj5-Ih7PZjGyEeYubFxdNHLKMQrcfimLwAApVWryJ56+ltQLGRymiLwr7TGxmcwCqymYIyEEomyuZlzL3yvCK-GFYolGm65qvSMIVxWb6mJxuYxuUZWCUC6NWXDLcxmKzRwEOVEbNJF325IqlLU6xrh6uG2tuawSmxRLMrOsCxyuCK4eFeeFA0HuewFse4ABmqhxJDA6FUWigBS0EDohcfUBoEG0YFw5FQO9-0LK8bzvB8nxfN8PyfCs5yrA1GSMCJ7SdBE7F6ONGx3AVgVZCJHE3SJ+iGAjz0xa9b3vT8oPfMdP2Ai9vWwT9v1-LEtAAN0IABrP9mNAqiIOfV86K2BiBOYz8EEfbjMEA146jgukFyQhAQQdEI+xcd0BTzEV-gREZyPSSjwJo0SYKgRjMSkp8aHvdBCHQXAqBxQDL2cgBbGzTLA6jIMs+in18vA7KgGSuMIeT6SU0NaXnRD9EQZFu0tRxbGtaEQRTW11L6EIZFFdMrDPNEBLMgKROg4LrMqlz6tYn8tD-WTeP4kDGsCmrxJC+rBPMp9IrkhTtDi2cVKS9oQQ5HsRglaF+Ty-5vjmE8ytHCj-OE2irIG+99uEhz0Ccly3I87zQsOiyepwBj+q6iK2pixT5GUxKGWShBUp7RF1oFQZHUI9LSqSNEtEICA4F0ZiwwQz6Pgy0wRURFCYkiDkbAFQxmT3FlzBsUFkS8aURzlC8diyfY4f1BGjB3R03FR+0YUx7GUOCNwCbCQd02MHMTPHPEaYjRdDGhJ0HWMIZG05Dxo07YVxQ8QZpkBFwyYq7abrEu6nxF1SvotXBRUBLslsmCJLFCUVsq6YZpYywXru63WWJC2GEvhmsJRNIJVeGC2IW6IVirre0zAWcxnce3baqu8KDamlK7B+BwUMDvSxh7IrD1B8rOu1129oE5qwCTun1LrGNbA8YEB1Kha9JbXA-mK90Y6L6q3fu7aK59xwTVN5YMqDwVYn3Tld2loZCf+KxO6EnW9oerv+8XDxgmH82AZbpMQY28mtqX4v4-6sv17U6EhR+OYkY5RuEQByJW-XUewYSIA */
  id: "search",
  initial: "bootstrap",
  context: ({ input }) => ({
    currentQ: input.q ?? "",
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
          actions: ["assignQToContext"],
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
            actions: ["toggleFilterInContext", "emitFilterToggled"],
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
        TYPING: {
          actions: ["assignQToContext"],
        },
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: ["resetFilters"],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
        LOAD_MORE: {
          guard: "contextHasSearchString",
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
                    q: context.currentQ,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
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
                    q: context.currentQ,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
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
                q: context.currentQ,
                queryClient: context.queryClient,
                filters: context.selectedFilters,
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
