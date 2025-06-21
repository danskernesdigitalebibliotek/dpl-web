import { assign, emit, setup } from "xstate"

import { correctFacetNames } from "./helpers"
import { getFacets, performSearch } from "./queries"
import { initialContext } from "./search.machine"
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
          const updatedFilterTerms = selectedFilters[filterName].filter(
            filterValue => filterValue !== value
          )
          if (updatedFilterTerms.length === 0) {
            delete selectedFilters[filterName]
            return selectedFilters
          }
          return {
            ...selectedFilters,
            [name]: updatedFilterTerms,
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
    setCurrentQueryInContext: assign({
      currentQuery: ({ event }) => event.q,
    }),
    setSubmittedQueryInContext: assign({
      submittedQuery: ({ context }) => (context.submittedQuery = context.currentQuery),
    }),
    resetFilters: assign(() => ({
      selectedFilters: initialContext.selectedFilters,
    })),
    resetCurrentQuery: assign(() => ({
      currentQuery: initialContext.currentQuery,
    })),
    resetSearchData: assign(() => ({
      searchData: initialContext.searchData,
    })),
    resetOffset: assign(() => ({
      searchOffset: initialContext.searchOffset,
    })),
    setFacetDataInContext: assign({
      facetData: ({
        event: {
          output: {
            search: { facets },
          },
        },
      }) => {
        return correctFacetNames(facets)
      },
    }),
    setSearchDataInContext: assign({
      searchData: ({
        event: {
          output: { search },
        },
      }) => {
        return {
          hitcount: search.hitcount,
          pages: [[...search.works]],
        }
      },
    }),
    addMoreDataInContext: assign({
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
    contextHasSearchString: ({ context }) => {
      return Boolean(context.currentQuery && context.currentQuery.length > 0)
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
