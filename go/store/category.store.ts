import { createStore } from "@xstate/store"

type TContext = {
  showCategorySlider: boolean
}

const categoryStore = createStore({
  // Initial context
  context: {
    showCategorySlider: false,
  } as TContext,
  // Transitions
  on: {
    setShowCategorySlider: (context, { showCategorySlider }: { showCategorySlider: boolean }) => ({
      ...context,
      showCategorySlider: showCategorySlider,
    }),
  },
})

export { categoryStore }
