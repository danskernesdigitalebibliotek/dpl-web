import Redis from "ioredis"

import { getServerEnv } from "@/lib/config/env"

// Memoized per-process Redis client.
let redisClient: Redis

export function getRedisClient() {
  if (!redis) {
    redisClient = new Redis(getServerEnv("REDIS_URL"))
  }

  return redisClient
}
