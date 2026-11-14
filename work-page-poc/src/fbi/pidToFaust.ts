/**
 * FBS knows a manifestation by its faust number, the part of the FBI pid
 * after the colon, e.g. "870970-basis:54029519" → "54029519".
 */
export const pidToFaust = (pid: string) => pid.split(":")[1] ?? pid
