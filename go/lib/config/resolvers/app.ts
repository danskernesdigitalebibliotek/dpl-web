import isChromatic from "chromatic/isChromatic"

const app = {
  "app.url": () => {
    if (isChromatic()) {
      return "https://hellboy.the-movie.com"
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL
    }
  },
}

export default app
