import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"

export type TMaterialTypeCategories = {
  reading: GeneralMaterialTypeCodeEnum[]
  listening: GeneralMaterialTypeCodeEnum[]
  gaming: GeneralMaterialTypeCodeEnum[]
  video: GeneralMaterialTypeCodeEnum[]
  ebook: GeneralMaterialTypeCodeEnum[]
  podcast: GeneralMaterialTypeCodeEnum[]
}

const materialTypes = {
  "materialtypes.sortpriority": [
    "BOOKS",
    "EBOOKS",
    "AUDIO_BOOKS",
    "PODCASTS",
    "BOARD_GAMES",
    "ARTICLES",
    "COMICS",
    "COMPUTER_GAMES",
    "FILMS",
    "IMAGE_MATERIALS",
    "MUSIC",
    "NEWSPAPER_JOURNALS",
    "OTHER",
    "SHEET_MUSIC",
    "TV_SERIES",
  ] as GeneralMaterialTypeCodeEnum[],

  "materialtypes.translations": {
    ARTICLES: "Artikel",
    BOOKS: "Bog",
    COMICS: "Tegneserie",
    EBOOKS: "E-bog",
    IMAGE_MATERIALS: "Billedmateriale",
    NEWSPAPER_JOURNALS: "Avis",
    AUDIO_BOOKS: "Lydbog",
    MUSIC: "Musik",
    PODCASTS: "Podcast",
    SHEET_MUSIC: "Noder",
    BOARD_GAMES: "Brætspil",
    COMPUTER_GAMES: "Computerspil",
    FILMS: "Film",
    TV_SERIES: "Tv-serie",
    OTHER: "Andet",
  } as { [key in GeneralMaterialTypeCodeEnum]: string },

  "materialtypes.categories": {
    reading: ["ARTICLES", "BOOKS", "COMICS", "IMAGE_MATERIALS", "NEWSPAPER_JOURNALS"],
    listening: ["AUDIO_BOOKS", "MUSIC", "SHEET_MUSIC"],
    gaming: ["BOARD_GAMES", "COMPUTER_GAMES"],
    video: ["FILMS", "TV_SERIES"],
    ebook: ["EBOOKS"],
    podcast: ["PODCASTS"],
  },
}

export default materialTypes
