import { assign, emit, setup } from "xstate"

import { getFacets, performSearch } from "./queries"
import { TContext, TFilters, TInput } from "./types"

export default setup({
  types: {
    context: {} as TContext,
    input: {} as TInput,
  },
  actions: {
    toggleFilterInContext: assign({
      selectedFilters: ({ event: { name, value }, context: { selectedFilters } }) => {
        const filterName = name as keyof TFilters
        if (!selectedFilters) {
          selectedFilters = {}
        }

        if (!selectedFilters.hasOwnProperty(filterName)) {
          selectedFilters[filterName] = []
        }
        // Remove filter.
        if (selectedFilters[filterName] && selectedFilters[filterName].includes(value)) {
          return {
            ...selectedFilters,
            [name]: selectedFilters[filterName].filter(filterValue => filterValue !== value),
          }
        }
        // Add filter.
        return {
          ...selectedFilters,
          [name]: [...(selectedFilters[filterName] ?? []), value],
        }
      },
    }),
    emitFilterToggled: emit(({ event }) => ({
      type: "filterToggled",
      toggled: event,
    })),
    assignQueryToContext: assign({
      currentQ: ({ event }) => event.q,
    }),
    resetFiltersIfNoQuery: assign({
      selectedFilters: ({ context }) => {
        if (!context.currentQ) {
          return {}
        }
        return context.selectedFilters
      },
    }),
    resetFilters: assign(() => ({
      selectedFilters: {},
    })),
    resetSearchData: assign(() => ({
      searchData: undefined,
    })),
    setFacetDataInContext: assign({
      facetData: ({
        event: {
          output: {
            search: { facets },
          },
        },
      }) => facets,
    }),
    setSearchDataInContext: assign({
      searchData: ({
        event: {
          output: { search },
        },
        context: { searchData },
      }) => {
        return {
          hitcount: search.hitcount,
          pages: [...(searchData?.pages ?? []), [...search.works]],
        }
      },
    }),
    setQueryClientInContext: assign({
      queryClient: ({ event }) => event.queryClient,
    }),
    setInitialFiltersInContext: assign({
      selectedFilters: ({ event }) => event.filters,
    }),
    setLoadMoreValuesInContext: assign({
      searchOffset: ({ context: { searchOffset, searchPageSize, searchData } }) => {
        if (!searchData) {
          return searchOffset
        }
        return searchOffset + searchPageSize
      },
    }),
  },
  actors: {
    performSearch,
    getFacets,
  },
  guards: {
    eventHasSearchString: ({ event }) => {
      return Boolean(event.q && event.q.length > 0)
    },
    contextHasSearchString: ({ context }) => {
      return Boolean(context.currentQ && context.currentQ.length > 0)
    },
    contextHasQueryClient: ({ context }) => {
      return Boolean(context.queryClient)
    },
    maxLimitReached: ({ context: { searchPageSize, searchData } }) => {
      if (!searchData) {
        return false
      }
      return searchData.pages.length >= Math.ceil(searchData.hitcount / searchPageSize)
    },
  },
})
