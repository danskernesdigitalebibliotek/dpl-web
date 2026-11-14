/** One decision: the rule applied, the FBI (or other) input it read, and what came of it. */
export type TraceRow = { rule: string; input: string; outcome: string }

export type TraceSection = { title: string; intro?: string; rows: TraceRow[] }

/** A category's general rules, rendered from the same constants its code uses. */
export type RuleGroup = { title: string; rules: string[] }
