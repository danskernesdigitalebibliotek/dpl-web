// Neutral (non-"use client") module so the query key can be imported from both
// the client hook and server components (e.g. the work-page prefetch). Exports
// from a "use client" module become client references and can't run on the server.
export const branchTitleQueryKey = (isilId: string) => ["branchTitle", isilId] as const
