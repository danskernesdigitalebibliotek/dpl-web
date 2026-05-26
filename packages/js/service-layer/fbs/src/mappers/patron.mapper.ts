import { z } from "zod";

import type { AuthenticatedPatron } from "../../../src/types";

const AuthenticatedPatronSchema = z.object({
  authenticateStatus: z.enum(["VALID", "INVALID", "LOANER_LOCKED_OUT"]),
  patron: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
});

export function parseAndMapAuthenticatedPatron(
  raw: unknown,
): AuthenticatedPatron {
  const parsed = AuthenticatedPatronSchema.parse(raw);
  return {
    status:
      parsed.authenticateStatus === "LOANER_LOCKED_OUT"
        ? "LOCKED_OUT"
        : parsed.authenticateStatus,
    patron: parsed.patron ? { name: parsed.patron.name } : undefined,
  };
}
