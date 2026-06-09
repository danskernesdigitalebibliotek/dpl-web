/**
 * @file
 * Functions for interaction with the Redis-based session-store.
 */
import { getRedisClient } from "@/lib/redis"
import { SessionId } from "@/lib/session/definitions"

type SessionStorageKey = string

/**
 * Get a single value from the Redis session object by its JSON path.
 */
export async function getSessionValue(id: SessionId, jsonPath: string) {
  const redis = getRedisClient()
  const storageKey = getSessionStorageKey(id)

  return redis.call("JSON.GET", storageKey, jsonPath)
}

/**
 * Get all values from the Redis session object.
 */
export async function getSessionValues(id: SessionId) {
  const redis = getRedisClient()
  const storageKey = getSessionStorageKey(id)

  return redis.call("JSON.GET", storageKey, "$")
}

/**
 * Get the Redis storage key for a session, based on session ID.
 *
 * Just a small wrapper for composing the key to ensure it is uniform across
 * the functions that use it.
 */
export function getSessionStorageKey(id: SessionId): SessionStorageKey {
  return `go-session-${id}`
}

export async function setSessionValue(id: SessionId, jsonPath: string, value: unknown) {
  const redis = getRedisClient()
  const storageKey = getSessionStorageKey(id)

  return redis.call("JSON.SET", storageKey, jsonPath, JSON.stringify(value))
}
