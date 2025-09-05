import { z } from "zod"

export const zodParseWithContext = <T>(zodParsingFunction: () => T, context: string): T => {
  try {
    return zodParsingFunction()
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`${error.message}\n${context}`)
    }
    throw error
  }
}
