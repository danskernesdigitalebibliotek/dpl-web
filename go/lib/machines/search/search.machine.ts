import { and, not } from "xstate"

import searchMachineSetup from "./search.machine.setup"

export const initialContext = {
  searchOffset: 0,
  searchPageSize: 0,
  facetLimit: 0,
  currentQuery: "",
  submittedQuery: undefined,
  searchData: undefined,
  facetData: undefined,
  selectedFilters: {},
  queryClient: null,
}

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0ANgCMAVlwAWAJzGATDIAcNmeYDM9zwBoQAT0QLAHZcYycnIKdTSNcndysAXwTfFAwcAmIyCmp6ZhZGAEFuAQAJfKZuEXEAcVkFJBBlNQ1tXQMEQytjS0cbKyCg0xdwpytzXwCEd2jcGxt3d1Gne273AaSUtCw8IlJySlpGViqRJhECoRYAMREhJh46Ot0m9U0dBvaTR1Cw0ysFpzmLxuCaIKxDXCmdw2cwyFamYyLKIbECpbYZPbZWgAIQA8rimHQKgUAAosAAiuPEDCeDReLXeoE+5iiuCC0Js9isK36phhoIQphkNlC4Ui0RczniphRaPSuyyBxoeIJRO4pIpVJppnqShUr1aHyMLNMbI5XJ5g35-kQZlFESiMSl4NlW3SqggABswDQmLjqtUhAxrrd7txaXrmm82oh4j17C47OYHE5jALHPZcOYuiNxXF3A5XWk8B7vb7-YHgzc7jwpDrnvqGTGEPYgiKvH1ls4gkDugLzBZcAWglygmE22ZjEX0aWfUxeCSqrV5A2o4amcbubM-vY5gsYQiggK21ZIcCZHDjD3wVPkqi3SWvT7CsUShHGo3o0apnEs64HDInj2KYfJxAKiIigOxh9DIgyptCMp3nKj5li+pR1rqH5roy+ixgMkLcjYCLmD2Ep2AKsS4BEMLsi4njuAO07uk+NBCLiBTkiwACyuLcDSK50p+664YKRG4LutjxPYXIXgO9gCiBcxUQ4V7TMsaw2EETF4AAZqonokGA6CqFoUAFFoEB0A+JlQDQEDaGAuDkKghlOQ+uB6QZRk2eZlnWaZ770l+G4dHyMhZuYLJtqmbh-DIVj9qebgjmMgJcg4XTaR5+mGcZpm+VZxY2b6C5LoFQk4e0CKAZCUKjh4qatk4x5ONYgJXpywoIn8t6bMW2VeXlZkWYV2zFWhb4CZGBqVYEgIhF00knsByymAKhieElfLZqBUREYkSHuZ5uU+SN-m2RNGGrjNzZ8osuBuM4MmmAmXLuMekSzHCaz9D25hzFph39cd3n5WdRWmW5-XIcV9laI5JkAG6EAA1o5yEDSdYN+RDUBQ+iMOmQgSOEJgLlvHU5XYbdbjGLMdjCms4w2i2VitZyJFRPY5hZSDQ0Fed+PpITtlGeghDoLgVCei5OkSwAtkLuk5aDw042NkMYyLxNaMjZMMpTU1YTd36jCEcHsv04LAcKCl9F9Xj-D2vMq-z4Ma3jfOY6rdkObgJNo0r3tu+rOA2cHwc2Trevk9ohuYUFwlVZe1jc+K3P9kE4WSg4PNA+ifOnaH2Dh17hemTQYsS1LMskHL6CKxj5dq6NYeQ2XrtRyT+sU-IVMmyFZvWHFuf9giykW3nfXop6hCoBANlcRLYCt9g3BwAArgZsBK7DfsB+j7mz-Pi-L6v6+wFvZC70T3ex1o8fXU236GHydNdPFxj9P9CwrRR3zcx2nMMI3MxhZWPgvUyS90ArwfBfK+O8RaV3QOLSW0tZYKyDhA0+MDz6b23jfKA0dSb30foJamL8XqtSoS9WCrYPBWDGApLw7hxKLRAmzaY4I853i0IQCAcBdDISfsFEShhASsIiK2YcX8rTM0mJ0ECWZtr-G5BYNYcQsoKn2NQERScjBODcFREc7IryyO2utNY4kGJZ0YdzXOMIDrT2Yt6PRs1QqZnCMmScYwrxxDCOBGQdMNEMQsK4KwwonH3mBp3bGq8bJuObOyEIwIcw9jtg7Lwfw0rzEBFEpusSW6C2EeQgeIlIiWA8AOZMGcWZCgWnCBMY5ohf2gu4F2g0i7xM1u5EWiTTYLCzKEmp8jECjmsN9J2U9okF0KQLXGQc4ZgH6SFF6n1aLTBaT2cU6ZoKhCBPEJmHSsZFIWXzFZ5TATWM-hEUZCBCJDivOlREUjui9RmekZu8yPYR2bhc9o+ZrlpLucmEUw4hjO3zp8uZ7s26e1drgJZ-zAgySzMMII3IryczWizf6pozCT3AXPSBUBoGwOLPA7eyKOi2BFFCH+QEezxCYXUv4lgMUOCzg4IYYQiUnygWfOB+Dr59NKc-EKnQByQgYvMRlDCWWTBeoM9KwFslcIsEkJIQA */
  id: "search",
  initial: "bootstrap",
  context: ({ input }) => ({
    searchOffset: input.initialOffset ?? initialContext.searchOffset,
    searchPageSize: input.searchPageSize ?? initialContext.searchPageSize,
    facetLimit: input.facetLimit ?? initialContext.facetLimit,
    currentQuery: input.q ?? initialContext.currentQuery,
    submittedQuery: initialContext.submittedQuery,
    searchData: initialContext.searchData,
    facetData: initialContext.facetData,
    selectedFilters: input.filters ?? initialContext.selectedFilters,
    queryClient: input.queryClient ?? initialContext.queryClient,
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
            actions: [
              "resetSearchData",
              "resetOffset",
              "toggleFilterInContext",
              "emitFilterToggled",
            ],
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
            actions: [
              "resetSearchData",
              "resetFilters",
              "setSubmittedQueryInContext",
              "resetOffset",
            ],
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
        RESET_BOOTSTRAP_STATE: {
          target: "bootstrap",
        },
      },
    },
    filteringAndSearching: {
      type: "parallel",
      initial: "search",
      on: {
        TYPING: [
          {
            actions: ["setCurrentQueryInContext"],
          },
        ],
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: [
              "resetSearchData",
              "resetFilters",
              "resetOffset",
              "setSubmittedQueryInContext",
            ],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
      },
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
