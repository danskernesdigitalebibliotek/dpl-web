import Redis from "ioredis"

import { getServerEnv } from "@/lib/config/env"

// lazyConnect defers the TCP connect until the first command, so importing
// this module (e.g. from a unit test that mocks the session wrapper) does
// not open a socket. The session wrapper's read/write paths handle connect
// failures explicitly.
const redis = new Redis(getServerEnv("REDIS_URL"), { lazyConnect: true })

export default redis
