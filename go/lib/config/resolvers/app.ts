import { getEnv } from "../env"

const app = {
  "app.url": () => {
    if (getEnv("APP_URL")) {
      return getEnv("APP_URL")
    }
  },
}

export default app
