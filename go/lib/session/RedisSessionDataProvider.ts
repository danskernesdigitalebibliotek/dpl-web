import type Redis from "ioredis"
// eslint-disable-next-line import-x/no-unresolved
import "server-only"

import { getRedisClient } from "@/lib/redis"
import { SessionId, TSessionData } from "@/lib/session/definitions"

type SessionStorageKey = string

export class RedisSessionDataProvider {
  protected redis: Redis
  protected storageKey: SessionStorageKey

  public constructor(protected sessionId: SessionId) {
    this.redis = getRedisClient()
    this.storageKey = `go-session:${this.sessionId}`
  }

  /**
   * Check if the user is authenticated.
   */
  public async getIsAuthenticated(): Promise<boolean> {
    return this.getValue("isAuthenticated")
  }

  public async getLibraryToken(): Promise<string> {
    return this.getValue("adgangsplatformenLibraryToken")
  }

  /**
   * Get the entire session data object.
   */
  public async getObject(): Promise<TSessionData | undefined> {
    return this.redis.hgetall(this.storageKey)
  }

  /**
   * Get a single value from the Redis session object by its JSON path.
   */
  public async getValue(key: string) {
    const raw = await this.redis.hget(this.storageKey, key)

    if (raw) {
      return JSON.parse(raw)
    }
  }

  /**
   * Set the expiration time of the session object.
   *
   * After this, Redis will automatically delete the session object and a re-login
   * will be forced.
   */
  public async setExpiresAt(unixTimestamp: number) {
    await this.redis.call("EXPIREAT", this.storageKey, unixTimestamp)
  }

  public async setIsAuthenticated(isAuthenticated: boolean) {
    await this.setValue("isAuthenticated", isAuthenticated)
  }

  /**
   * Set the time-to-live for the session object.
   *
   * After this, Redis will automatically delete the session object and a re-login
   * will be forced.
   */
  public async setTtl(seconds: number) {
    this.redis.call("EXPIRE", this.storageKey, seconds)
  }

  /**
   * Set a single value from the Redis session object by its JSON path.
   */
  public async setValue(key: string, value: unknown) {
    this.redis.hset(this.storageKey, key, JSON.stringify(value))
  }
}
