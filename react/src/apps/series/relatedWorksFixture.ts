import { RelatedWork } from "./relatedWorks.types";
import { Pid, WorkId } from "../../core/utils/types/ids";

// A captured slice of a real complex search response (2026-09-01, FBI API via
// dpl-cms.local): Lene Kaaberbøl's Danish books, sorted by first edition year
// descending - the exact query the real pipeline will run. Real ids, so
// covers resolve to real images while jamming on the design.
//
// The entries are hand-ordered to preview the fill algorithm's output:
// first-in-series works first (newest first), then the remaining works
// (newest first). The real algorithm arrives in a later commit and will do
// this - plus dedupe within a series - from the raw response order.
//
// Edge cases, all genuine except the one marked hand-edited:
// - W.I.T.C.H members have numberInSeries: null (unnumbered series)
// - "Skyggeporten" belongs to no series at all
// - The Nina Borg books are co-authored (two creators)
// - "Vildheks 1./2. samling" duplicate the part numbers of the volumes they
//   collect ("Del 1"/"Del 2" appear twice in the series)
// - The large-print "Kadaverdoktoren" volumes form their own two-part series,
//   separate from the Madeleine Karno crime series the novel opens
// - "Stilnerens musik" has a hand-edited, non-existent cover pid to exercise
//   the missing-cover rendering

const WITCH =
  "dcaa2a768a71947ec8ed3814b9bede68d654b85664c1a6d43e565a8eaa4800f6";
const VILDHEKS =
  "0ad204872c9d82c0719a15cb6cfe341a6486a99ac7f393e9da1e7746ac672718";
const BAERFOLKET =
  "a2c0dacbbe4ec01676eaf5cad22a7a956010f39197165ef0c73d668aed455c7d";
const MADELEINE_KARNO =
  "34b9c1b8b357d75bd30422bc01ec6c8e1af96c989e3e5d0d03fb03a83a0134a9";
const NINA_BORG =
  "753f4d7495bcbcad81eb733e1950ae340ddaf09f8178c0132623292457c3af18";
const KADAVERDOKTOREN_STORSKRIFT =
  "c2d57120aa1f339806f288844bb63f262f40955289a3f3bab8481f0e1c30dff9";
const SKAMMEREN =
  "e852dfe79969e05b42f487a65cecf6aec2d325f4fec98d08aad6860f8bc58853";
const SOELVHESTEN =
  "f5b56c157bf598f85fad32cfc40bb769dd56a9517bb692667e8b1471c27e4387";

const KAABERBOEL = ["Lene Kaaberbøl"];
const KAABERBOEL_FRIIS = ["Lene Kaaberbøl", "Agnete Friis"];

const work = (
  workId: string,
  title: string,
  creators: string[],
  year: number | null,
  series: RelatedWork["series"],
  coverPid: string
): RelatedWork => ({
  workId: workId as WorkId,
  title,
  creators,
  year,
  series,
  coverPid: coverPid as Pid
});

const inSeries = (
  seriesId: string,
  title: string,
  numberInSeries: string | null,
  readThisFirst: boolean | null = null
): RelatedWork["series"][number] => ({
  seriesId,
  title,
  numberInSeries,
  readThisFirst
});

export const relatedWorksFixture: RelatedWork[] = [
  // --- First parts of a series, newest first ------------------------------
  work(
    "work-of:870970-basis:29153884",
    "Fortællinger om bærfolket",
    KAABERBOEL,
    2011,
    [inSeries(BAERFOLKET, "Fortællinger om bærfolket", "Del 1", true)],
    "870970-basis:29153884"
  ),
  work(
    "work-of:870970-basis:28456735",
    "Kadaverdoktoren",
    KAABERBOEL,
    2010,
    [
      inSeries(
        MADELEINE_KARNO,
        "Krimiserien med Madeleine Karno",
        "Del 1",
        true
      )
    ],
    "870970-basis:51163028"
  ),
  work(
    "work-of:870970-basis:28655630",
    "Kadaverdoktoren. Bind 1 (Stor skrift)",
    KAABERBOEL,
    2010,
    [inSeries(KADAVERDOKTOREN_STORSKRIFT, "Kadaverdoktoren", "Bind 1")],
    "870970-basis:28655630"
  ),
  work(
    "work-of:800010-katalog:99122408312905763__1",
    "Vildheks. 1. samling",
    KAABERBOEL,
    2010,
    [inSeries(VILDHEKS, "Vildheks", "Del 1", true)],
    "870970-basis:29601151"
  ),
  work(
    "work-of:870970-basis:28394438",
    "Vildheks. Bind 1 : Ildprøven",
    KAABERBOEL,
    2010,
    [inSeries(VILDHEKS, "Vildheks", "Del 1", true)],
    "870970-basis:38283812"
  ),
  work(
    "work-of:870970-basis:27522181",
    "Drengen i kufferten : kriminalroman",
    KAABERBOEL_FRIIS,
    2008,
    [inSeries(NINA_BORG, "Krimiserien med Nina Borg", "Del 1", true)],
    "870970-basis:27522181"
  ),
  work(
    "work-of:870970-basis:22758454",
    "Skammerens datter",
    KAABERBOEL,
    2000,
    [inSeries(SKAMMEREN, "Skammerens datter", "Del 1", true)],
    "870970-basis:48778798"
  ),
  // --- Everything else, newest first --------------------------------------
  work(
    "work-of:870970-basis:24210758",
    "Den grusomme kejserinde",
    KAABERBOEL,
    null,
    [inSeries(WITCH, "W.I.T.C.H", null)],
    "870970-basis:54173326"
  ),
  work(
    "work-of:870970-basis:24253597",
    "Havets ild",
    KAABERBOEL,
    null,
    [inSeries(WITCH, "W.I.T.C.H", null)],
    "870970-basis:54173350"
  ),
  work(
    "work-of:870970-basis:24218139",
    "Stilnerens musik",
    KAABERBOEL,
    null,
    [inSeries(WITCH, "W.I.T.C.H", null)],
    // Hand-edited: no cover exists for this pid.
    "870970-basis:00000000"
  ),
  work(
    "work-of:870970-basis:51362241",
    "Vildheks. Bind 6 : Genkommeren",
    KAABERBOEL,
    2014,
    [inSeries(VILDHEKS, "Vildheks", "Del 6")],
    "870970-basis:51362241"
  ),
  work(
    "work-of:870970-basis:50681769",
    "Flere fortællinger om bærfolket",
    KAABERBOEL,
    2013,
    [inSeries(BAERFOLKET, "Fortællinger om bærfolket", "Del 2")],
    "870970-basis:50681769"
  ),
  work(
    "work-of:870970-basis:29847029",
    "Det levende kød",
    KAABERBOEL,
    2013,
    [inSeries(MADELEINE_KARNO, "Krimiserien med Madeleine Karno", "Del 2")],
    "870970-basis:29847029"
  ),
  work(
    "work-of:870970-basis:50568024",
    "Vildheks. Bind 5 : Fjendeblod",
    KAABERBOEL,
    2013,
    [inSeries(VILDHEKS, "Vildheks", "Del 5")],
    "870970-basis:38283863"
  ),
  work(
    "work-of:800010-katalog:99122228681905763__1",
    "Vildheks. 2. samling",
    KAABERBOEL,
    2012,
    [inSeries(VILDHEKS, "Vildheks", "Del 2")],
    "870970-basis:51967518"
  ),
  work(
    "work-of:870970-basis:29622469",
    "Vildheks. Bind 4 : Blodsungen",
    KAABERBOEL,
    2012,
    [inSeries(VILDHEKS, "Vildheks", "Del 4")],
    "870970-basis:38283855"
  ),
  work(
    "work-of:870970-basis:28990243",
    "Nattergalens død : en Nina Borg-krimi",
    KAABERBOEL_FRIIS,
    2011,
    [inSeries(NINA_BORG, "Krimiserien med Nina Borg", "Del 3")],
    "870970-basis:28990243"
  ),
  work(
    "work-of:870970-basis:28693788",
    "Vildheks. Bind 2 : Viridians blod",
    KAABERBOEL,
    2011,
    [inSeries(VILDHEKS, "Vildheks", "Del 2")],
    "870970-basis:38283839"
  ),
  work(
    "work-of:870970-basis:28898274",
    "Vildheks. Bind 3 : Kimæras hævn",
    KAABERBOEL,
    2011,
    [inSeries(VILDHEKS, "Vildheks", "Del 3")],
    "870970-basis:38283847"
  ),
  work(
    "work-of:870970-basis:28136013",
    "Et stille umærkeligt drab : en Nina Borg roman",
    KAABERBOEL_FRIIS,
    2010,
    [inSeries(NINA_BORG, "Krimiserien med Nina Borg", "Del 2")],
    "870970-basis:28136013"
  ),
  work(
    "work-of:870970-basis:26488613",
    "Skyggeporten",
    KAABERBOEL,
    2006,
    [],
    "870970-basis:51666518"
  ),
  work(
    "work-of:870970-basis:54525044",
    "Den gyldne føniks (Samlet udgave)",
    KAABERBOEL,
    2003,
    [inSeries(WITCH, "W.I.T.C.H", null)],
    "870970-basis:54525044"
  ),
  work(
    "work-of:870970-basis:24923703",
    "Skammerkrigen",
    KAABERBOEL,
    2003,
    [inSeries(SKAMMEREN, "Skammerens datter", "Del 4")],
    "870970-basis:52244218"
  ),
  work(
    "work-of:870970-basis:23358484",
    "Skammertegnet",
    KAABERBOEL,
    2001,
    [inSeries(SKAMMEREN, "Skammerens datter", "Del 2")],
    "870970-basis:61705104"
  ),
  work(
    "work-of:870970-basis:23790777",
    "Slangens gave",
    KAABERBOEL,
    2001,
    [inSeries(SKAMMEREN, "Skammerens datter", "Del 3")],
    "870970-basis:29685444"
  ),
  work(
    "work-of:870970-basis:25436571",
    "Isfuglen : historien om Katriona Bredinari",
    KAABERBOEL,
    1992,
    [inSeries(SOELVHESTEN, "Sølvhesten", "Del 3")],
    "870970-basis:53648010"
  )
];
