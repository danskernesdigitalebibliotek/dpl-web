import { and, not } from "xstate"

import searchMachineSetup from "./search.machine.setup"

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0ANgCMAVlwAWAJzGATDIAcNmeYDM9zwBoQAT0QLAHZcYycnIKdTSNcndysAXwTfFAwcAmIyCmp6ZhZGAEFuAQAJfKZuEXEAcVkFJBBlNQ1tXQMEQytjS0cbKyCg0xdwpytzXwCEd2jcGxt3d1Gne273AaSUtCw8IlJySlpGViqRJhECoRYAMREhJh46Ot0m9U0dBvaTR1Cw0ysFpzmLxuCaIKxDXCmdw2cwyFamYyLKIbECpbYZPbZWgAIQA8rimHQKgUAAosAAiuPEDCeDReLXeoE+5iiuCC0Js9isK36phhoIQphkNlC4Ui0RczniphRaPSuyyBxoeIJRO4pIpVJppnqShUr1aHyMLNMbI5XJ5g35-kQZlFESiMSl4NlW3SqggABswDQmLjqtUhAxrrd7txaXrmm82mD7CL2V4FjZwt0rFYBfZ7E5cB5hXzPOYhdN3K60ngPd7ff7A8GbnceFIdc99QyYwh7EERV4+stnEEgd0BYXLO5jEEuUEwp2zMZS+iKz6mLwSVVavJm1HDUzjdzZn84-NoYWxwLO1ZIcCZHCx+ZwbPkqi3eWvYvl6vG7rGi3o0bBUEZKEfwAu4t6eAi7gClC56jOYnaDCBQRpqOc7ui+uRFKUEZfpujL6IgizuDmrgODInj2KYfJxAKiIisefQyIMTg0TKD5ys+laFMUJQfhuBq4e0awhPuNgIrBhYxMYAqxLgEQwuyLieCBLGbGWuALjQQi4gU5IsAAsri3A0uudLflueGCiJuBxrY8SZlYV6FvYkF8iKTErOyQxeHBKF4AAZqonokGA6CqFoUAFFoEB0E+oVQDQEDaGAuDkKgQXJU+uD+YFwWxRFUUxWFWH0j+24dHyAHmJVslMW4fwyOmNoILeuBuOOYyAlyDhdD5mUBUFIVhXl0VlrF6WqWxsXxYlalaAAboQADWSVsb12UDeFkXDdso0rRNYUIKF82YKlbx1EVpn8YEbjGLMdjCms4yNVy2acrBUT2OYPVZf1uWbQVUBjeie1xcF6CEOguBUJ6qW+eDAC2gPpN9OWDX9I1hYjeDAwdc2EMdDJncZkZ8W2owhIx7L9OC5HCpBfSzHC8QPV9fUoxt+XowDyMQ9zk0JVoSWHYty0ZbzqMc9tGPc6tP37UL+OnfI504W2QorNYH3ih9Q7-jJxEfSza2-RLOCjdLYsg+gYMQ1DMPw5jMts0N-2OzzrPrTjR0ndohOfsVZntGT1h1Q4j2TMeMljkM-Y9Z6hCoBAsW6eDYBbTg3BwAAroFsCY3z01C0tDtxwnScp2n2AZ7A2dkHncu4wrPtK0T2Ek7+hh8jdXT1cY-TmIe5FOFJ3wfbeLlhB9Yyx-Hidhcn6Cp0+Vc17nwM0KD4OQ9DJCw+gCMrSXs9QPPi9lsvOd11Ant497Wi+7xrbt6YWYXu9DEdh4aZh4EiZWV05F-DiH8CwSQHxaEIBAOAug2IPxKuZQwgJCIRA7KOScvJrSTA7lyM0sEiwyDCB4FwPUFT7GoLAgORgnBuBkuOdkY5e5Wm-h0NYVkEL1W5OYUOMJEisQyguchl0yr2BkoCYwM4xhjjiGEai+DcBrDiMOVw9k+iG1luzCusUBFtnZCEYEXQIhML5AzRMlF+xpgoveFS6ILbO05pjLRv5IiWA8MOUOkEGLWEZvIqc443CqKdmjSWANdr-QcaVOIhEXEWDcU9fonivD-Bjrw1SNjAmmwxitfmYAwnmWfpEM0QDog3nFBmYwIpugJOZsk6x7tjYaKlu7HJ7QnGsJ7gYgU3IRSoISbCOM+DlKPhSbU8W9Subu1dpokyKtfwRNafo-sQ4ylyKjgY-x61bFBNdrgLJTSf72RzMMRC7k3qmCHJZMwFNPrVPSIfMuC8K7nzILsjotgRRQn7gsTM-Z4hjGcmMNk-9royD5O86epc57lyXlnC+wNnmdELJCECA8P4-MMb-TqACrBAPBFcpIQA */
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
          actions: ["setCurrentQueryInContext", "setSbmittedQueryInContext"],
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
            guard: "eventHasSearchString",
            actions: ["setCurrentQueryInContext"],
          },
          {
            actions: ["emitQDeleted", "resetQuery"],
          },
        ],
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: ["resetSearchData", "resetFilters", "setSbmittedQueryInContext"],
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
