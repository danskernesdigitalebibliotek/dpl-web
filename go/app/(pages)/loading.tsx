// Route loading boundary — do not remove. Without it a segment can commit
// without any DOM on soft navigation, and the App Router then skips its scroll
// reset, leaving the new page at the previous page's scroll position.
export { default } from "@/components/shared/pageLoading/PageLoading"
