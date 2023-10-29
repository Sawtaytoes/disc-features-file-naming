import "@total-typescript/ts-reset"
import "dotenv/config"

import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { nameAnimeEpisodes } from "./nameAnimeEpisodes.js"
import { nameSpecialFeatures } from "./nameSpecialFeatures.js"
import { copySubtitles } from "./copySubtitles.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

yargs(
  hideBin(
    process
    .argv
  )
)
.scriptName(
  "media"
)
.usage(
  "Usage: $0 <cmd> [args]"
)
.command(
  "copySubtitles <sourcePath> <destinationPath>",
  "Name all special features in a directory according to a DVDCompare.net URL.",
  (
    yargs
  ) => (
    yargs
    .example(
      "$0 \"~/disc-rips/movieName\" \"https://dvdcompare.net/comparisons/film.php?fid=55539#1\"",
      "Names all special features in the movie folder using the DVDCompare.net release at `#1`."
    )
    .positional(
      "mediaFilesPath",
      {
        demandOption: true,
        describe: "Directory with media files that need subtitles.",
        type: "string",
      },
    )
    .positional(
      "subtitlesPath",
      {
        demandOption: true,
        describe: "Directory containing subdirectories with subtitle files and `attachments/` that match the name of the media files in `mediaFilesPath`.",
        type: "string",
      },
    )
    .option(
      "automaticOffset",
      {
        alias: "a",
        default: true,
        describe: "Calculate subtitle offsets for each file using differences in chapter markers.",
        nargs: 1,
        type: "boolean",
      },
    )
    .option(
      "globalOffset",
      {
        alias: "o",
        default: 1,
        describe: "The offset in milliseconds to apply to all subtitles being transferred.",
        nargs: 1,
        number: true,
        type: "number",
      },
    )
  ),
  (argv) => {
    copySubtitles({
      globalOffsetInMilliseconds: (
        argv
        .globalOffset
      ),
      hasAutomaticOffset: (
        argv
        .automaticOffset
      ),
      mediaFilesPath: (
        argv
        .mediaFilesPath
      ),
      subtitlesPath: (
        argv
        .subtitlesPath
      ),
    })
    .subscribe()
  }
)
.command(
  "nameAnimeEpisodes <sourcePath> <searchTerm>",
  "Name all anime episodes in a directory according to episode names in MyAnimeList.",
  (
    yargs
  ) => (
    yargs
    .example(
      "$0 \"~/anime\" \"psycho-pass\"",
      "Names all video files in the directory based on the episode names on MyAnimeList."
    )
    .option(
      "seasonNumber",
      {
        alias: "s",
        default: 1,
        describe: "The season number to output when renaming useful for TVDB which has separate season number. For aniDB, use the default value 1.",
        nargs: 1,
        number: true,
        type: "number",
      },
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where all episodes for that season are located.",
        type: "string",
      },
    )
    .positional(
      "searchTerm",
      {
        demandOption: true,
        describe: "Name of the anime for searching MyAnimeList.com.",
        type: "string",
      },
    )
  ),
  (argv) => {
    nameAnimeEpisodes({
      searchTerm: (
        argv
        .searchTerm
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      seasonNumber: (
        argv
        .seasonNumber
      ),
    })
    .subscribe()
  }
)
.command(
  "nameSpecialFeatures <sourcePath> <url>",
  "Name all special features in a directory according to a DVDCompare.net URL.",
  (
    yargs
  ) => (
    yargs
    .example(
      "$0 \"~/disc-rips/movieName\" \"https://dvdcompare.net/comparisons/film.php?fid=55539#1\"",
      "Names all special features in the movie folder using the DVDCompare.net release at `#1`."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where speical features are located.",
        type: "string",
      },
    )
    .positional(
      "url",
      {
        demandOption: true,
        describe: "DVDCompare.net URL including the chosen release's hash tag.",
        type: "string",
      },
    )
  ),
  (argv) => {
    nameSpecialFeatures({
      sourcePath: (
        argv
        .sourcePath
      ),
      url: (
        argv
        .url
      ),
    })
    .subscribe()
  }
)
.strict()
.argv
