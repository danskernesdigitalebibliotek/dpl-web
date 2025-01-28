import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"

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
}

export default materialTypes
